import fs from "node:fs";
import path from "node:path";

const DEFAULT_MAX_SOURCE_AGE_DAYS = 120;
const METRIC_LIMITS = {
  timeLabel: 24,
  costLabel: 36,
  servicePattern: 32,
};

const verboseMetricPattern = /\b(planning range|depending on|can surge|check exact|official taxi stand|before committing|verify current|fare estimate|planning marker|normally more expensive)\b/i;
const farePattern = /\b\d[\d.,]*(?:\s?(?:NOK|GBP|EUR|USD|kr)|\s?-\s?\d|\s?\/\s?~?GBP)\b/i;
const passLikeCoveragePattern = /\b(covered|pass)\b/i;
const exampleCoverageLabels = [
  "Oslo Pass-covered",
  "Not Oslo Pass-covered",
  "Ruter ticket",
  "Vy/Ruter ticket",
  "Flytoget ticket",
  "Card/app payment",
];
const paymentRequiredValues = new Set(["yes", "no", "unknown", true, false]);
const bannedCoveragePatterns = [
  /^Oslo Pass airport\b/i,
  /^Oslo Pass zones\b/i,
  /^Not pass-covered$/i,
];
const qualifierCuePattern = /\b(zone|zones|local vy|airport trains?|airport train|ferry|season|seasonal|separate ticket|taxi|ride-app|premium airport)\b/i;
const canonicalPassCoveragePattern = /^(?:Not )?[A-Z][A-Za-z0-9 +&/]*(?: Pass| Card| Travelcard| Ticket)?-covered$/;
const canonicalTicketOrPaymentPattern = /^[A-Z][A-Za-z0-9 +&/]*(?: ticket| payment)$/i;
const taxiLikePattern = /\b(taxi|ride app|ride-app|private transfer|pre-booked transfer|transfer)\b/i;
const negativePassCoveragePattern = /^Not .*-covered$/i;
const serviceConfidenceValues = new Set(["high", "medium", "low"]);

const isRecord = (value) => Boolean(value && typeof value === "object" && !Array.isArray(value));
const asArray = (value) => Array.isArray(value) ? value : [];
const hasText = (value) => typeof value === "string" && value.trim().length > 0;

const walk = (value, visitor, pathParts = []) => {
  if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, visitor, [...pathParts, String(index)]));
    return;
  }

  if (!isRecord(value)) {
    return;
  }

  visitor(value, pathParts);
  Object.entries(value).forEach(([key, child]) => walk(child, visitor, [...pathParts, key]));
};

const pathLabel = (parts) => parts.length ? parts.join(".") : "<root>";

const parseDate = (value) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}/.test(value)) {
    return null;
  }
  const parsed = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const daysBetween = (a, b) => Math.floor((a.getTime() - b.getTime()) / 86400000);

const collectSources = (payload) => {
  const sourceMap = new Map();

  const addSource = (source, sourcePath) => {
    if (!isRecord(source)) {
      return;
    }
    const id = typeof source.id === "string" ? source.id.trim() : "";
    if (!id) {
      return;
    }
    sourceMap.set(id, { ...source, _path: sourcePath });
  };

  asArray(payload.transportBrief?.sources).forEach((source, index) => addSource(source, `transportBrief.sources.${index}`));
  asArray(payload.transportReport?.sources).forEach((source, index) => addSource(source, `transportReport.sources.${index}`));
  asArray(payload.evidence_summary).forEach((source, index) => addSource(source, `evidence_summary.${index}`));

  if (isRecord(payload.evidence_summary)) {
    Object.entries(payload.evidence_summary).forEach(([id, source]) => {
      sourceMap.set(id, isRecord(source) ? { id, ...source, _path: `evidence_summary.${id}` } : { id, claim: source, _path: `evidence_summary.${id}` });
    });
  }

  return sourceMap;
};

const collectEvidenceRefs = (payload) => {
  const refs = [];
  walk(payload, (node, parts) => {
    ["evidenceIds", "sourceIds"].forEach((field) => {
      asArray(node[field]).forEach((id, index) => {
        if (typeof id === "string" && id.trim()) {
          refs.push({ id: id.trim(), path: `${pathLabel(parts)}.${field}.${index}` });
        }
      });
    });
  });
  return refs;
};

const addIssue = (issues, code, path, message) => {
  issues.push({ code, path, message });
};

const getCoverageSortRank = (value) => {
  const label = typeof value === "string" ? value.toLowerCase() : "";
  if (label.includes("pass") || label.includes("covered")) return 0;
  if (label.includes("ticket")) return 1;
  if (label.includes("payment") || label.includes("card") || label.includes("app")) return 2;
  return 3;
};

const isCanonicalCoverageLabel = (label) => (
  canonicalPassCoveragePattern.test(label) ||
  canonicalTicketOrPaymentPattern.test(label)
);

const isTaxiLikeCard = (card) => {
  const fields = [
    card.id,
    card.modeLabel,
    card.roleLabel,
    card.routeLabel,
    card.useFor,
    card.bestFor,
    card.pattern,
    card.coverageQualifier,
  ].filter(hasText);
  return taxiLikePattern.test(fields.join(" "));
};

const validateServiceWindow = (card, cardPath, issues) => {
  const serviceWindow = card.serviceWindow;

  if (!isRecord(serviceWindow)) {
    addIssue(issues, "missing_service_window", `${cardPath}.serviceWindow`, "Airport arrival cards must include structured serviceWindow data for late-arrival decisions.");
    return;
  }

  [
    "firstService",
    "lastService",
    "typicalFrequency",
    "nightServiceStatus",
    "confidence",
  ].forEach((field) => {
    if (!hasText(serviceWindow[field])) {
      addIssue(issues, "missing_service_window_field", `${cardPath}.serviceWindow.${field}`, `${field} is required. Use "Check Timetable" when exact first/last timing is not verified.`);
    }
  });

  if (hasText(serviceWindow.confidence) && !serviceConfidenceValues.has(String(serviceWindow.confidence).toLowerCase())) {
    addIssue(issues, "invalid_service_confidence", `${cardPath}.serviceWindow.confidence`, "Service confidence must be high, medium, or low.");
  }

  ["firstServiceVerified", "lastServiceVerified"].forEach((field) => {
    if (typeof serviceWindow[field] !== "boolean") {
      addIssue(issues, "missing_service_verification", `${cardPath}.serviceWindow.${field}`, `${field} must be a boolean so unverified first/last services are visible.`);
    }
  });

  if (serviceWindow.confidence === "high" && (!serviceWindow.firstServiceVerified || !serviceWindow.lastServiceVerified)) {
    addIssue(issues, "overclaimed_service_confidence", `${cardPath}.serviceWindow.confidence`, "Use high confidence only when first and last service are both verified for the traveller direction.");
  }
};

export const validateTransportPayload = (rawPayload, options = {}) => {
  const today = options.today ? new Date(`${options.today}T00:00:00Z`) : new Date();
  const maxSourceAgeDays = options.maxSourceAgeDays ?? DEFAULT_MAX_SOURCE_AGE_DAYS;
  const payload = rawPayload?.transportBrief || rawPayload?.transportReport ? rawPayload : { transportBrief: rawPayload };
  const transportBrief = payload.transportBrief;
  const transportReport = payload.transportReport;
  const issues = [];

  if (!isRecord(transportBrief)) {
    addIssue(issues, "missing_transport_brief", "transportBrief", "Payload must include a transportBrief object before it can be written.");
    return { ok: false, issues };
  }

  const sources = collectSources(payload);
  const refs = collectEvidenceRefs(payload);

  if (refs.length > 0 && sources.size === 0) {
    addIssue(issues, "missing_sources", "sources", "Payload references evidenceIds but does not include sources or evidence_summary.");
  }

  refs.forEach(({ id, path: refPath }) => {
    if (!sources.has(id)) {
      addIssue(issues, "missing_evidence_reference", refPath, `Evidence reference "${id}" is not present in sources/evidence_summary.`);
    }
  });

  sources.forEach((source, id) => {
    const sourcePath = source._path || `sources.${id}`;
    if (!source.label && !source.claim) {
      addIssue(issues, "source_missing_label", sourcePath, `Source "${id}" needs a label or claim.`);
    }
    if (!source.url && !source.href) {
      addIssue(issues, "source_missing_url", sourcePath, `Source "${id}" needs a URL.`);
    }
    const checked = parseDate(source.checked || source.checkedAt || source.date);
    if (!checked) {
      addIssue(issues, "source_missing_checked_date", sourcePath, `Source "${id}" needs an ISO checked date.`);
      return;
    }
    const ageDays = daysBetween(today, checked);
    if (ageDays < -1) {
      addIssue(issues, "source_checked_in_future", sourcePath, `Source "${id}" has a checked date in the future.`);
    }
    if (ageDays > maxSourceAgeDays) {
      addIssue(issues, "stale_source", sourcePath, `Source "${id}" was checked ${ageDays} days ago; refresh before writing transport fares or service claims.`);
    }
  });

  const validateCard = (card, cardPath) => {
    if (!isRecord(card)) {
      return;
    }

    Object.entries(METRIC_LIMITS).forEach(([field, limit]) => {
      const value = card[field];
      if (typeof value !== "string" || !value.trim()) {
        return;
      }
      if (value.length > limit || verboseMetricPattern.test(value)) {
        addIssue(issues, "verbose_metric_field", `${cardPath}.${field}`, `${field} must stay compact; move caveats and explanations into watchOut, routeDetails, or transportReport.`);
      }
    });

    const coverage = asArray(card.coverage).filter((label) => typeof label === "string" && label.trim());
    const passLikeLabels = coverage.filter((label) => passLikeCoveragePattern.test(label));
    const coverageQualifier = typeof card.coverageQualifier === "string" ? card.coverageQualifier.trim() : "";
    const taxiLikeCard = isTaxiLikeCard(card);

    coverage.forEach((label, index) => {
      if (!isCanonicalCoverageLabel(label)) {
        addIssue(issues, "non_canonical_coverage_label", `${cardPath}.coverage`, `Coverage label "${label}" is not canonical. Use compact pass/ticket/payment labels, for example: ${exampleCoverageLabels.join(", ")}.`);
      }
      if (taxiLikeCard && negativePassCoveragePattern.test(label)) {
        addIssue(issues, "taxi_negative_pass_coverage", `${cardPath}.coverage`, `Taxi, ride-app and transfer cards should not display negative pass coverage "${label}"; omit the pass chip unless a source proves a positive taxi benefit.`);
      }
      if (qualifierCuePattern.test(label)) {
        addIssue(issues, "coverage_detail_in_label", `${cardPath}.coverage`, `Move decision detail from coverage label "${label}" into coverageQualifier.`);
      }
      if (index > 0) {
        const previous = coverage[index - 1];
        const previousRank = getCoverageSortRank(previous);
        const currentRank = getCoverageSortRank(label);
        if (previousRank > currentRank || (previousRank === currentRank && String(previous).localeCompare(String(label)) > 0)) {
          addIssue(issues, "coverage_order", `${cardPath}.coverage`, `Order coverage labels consistently: pass status first, then ticket labels, then payment/app labels.`);
        }
      }
    });

    passLikeLabels.forEach((label) => {
      if (!canonicalPassCoveragePattern.test(label)) {
        addIssue(issues, "mixed_coverage_label", `${cardPath}.coverage`, `Use canonical pass-status labels such as "Oslo Pass-covered" or "Not Oslo Pass-covered"; found "${label}".`);
      }
      if (bannedCoveragePatterns.some((pattern) => pattern.test(label))) {
        addIssue(issues, "banned_coverage_label", `${cardPath}.coverage`, `Coverage label "${label}" is too specific for compact cards; move the detail into routeDetails or transportReport.`);
      }
    });

    const uniquePassStatuses = new Set(passLikeLabels.map((label) => label.toLowerCase()));
    if (uniquePassStatuses.size > 1) {
      addIssue(issues, "conflicting_pass_coverage", `${cardPath}.coverage`, `A card should expose one pass-status label, then separate ticket/operator labels.`);
    }

    if (passLikeLabels.includes("Oslo Pass-covered") && !coverageQualifier) {
      addIssue(issues, "missing_coverage_qualifier", `${cardPath}.coverageQualifier`, `Oslo Pass-covered cards need visible coverageQualifier detail such as zones or local Vy airport trains only.`);
    }

    ["timeLabel", "costLabel", "servicePattern"].forEach((field) => {
      if (typeof card[field] === "string" && farePattern.test(card[field])) {
        const cardRefs = [...asArray(card.evidenceIds), ...asArray(card.sourceIds)];
        if (cardRefs.length === 0) {
          addIssue(issues, "fare_without_evidence", `${cardPath}.${field}`, `${field} contains fare-like data but the card has no evidenceIds/sourceIds.`);
        }
        cardRefs.forEach((id) => {
          const source = sources.get(id);
          if (!source) {
            return;
          }
          const checked = parseDate(source.checked || source.checkedAt || source.date);
          if (!checked || daysBetween(today, checked) > maxSourceAgeDays) {
            addIssue(issues, "stale_fare_evidence", `${cardPath}.${field}`, `${field} uses evidence "${id}" without a recent checked date.`);
          }
        });
      }
    });
  };

  asArray(transportBrief.airportArrival).forEach((card, index) => {
    validateCard(card, `transportBrief.airportArrival.${index}`);
    if (isRecord(card)) {
      validateServiceWindow(card, `transportBrief.airportArrival.${index}`, issues);
    }
  });
  asArray(transportBrief.cityTravel).forEach((card, index) => validateCard(card, `transportBrief.cityTravel.${index}`));

  const toolkit = asArray(transportBrief.toolkit);
  if (toolkit.length === 0) {
    addIssue(issues, "missing_toolkit", "transportBrief.toolkit", "Transport payload should include toolkit entries for planners, tickets, operators, passes, maps or fallback apps.");
  }

  toolkit.forEach((item, index) => {
    if (!isRecord(item)) return;
    const itemPath = `transportBrief.toolkit.${index}`;
    ["name", "category", "useFor", "actionLabel"].forEach((field) => {
      if (!hasText(item[field])) {
        addIssue(issues, "incomplete_toolkit_item", `${itemPath}.${field}`, `Toolkit item needs ${field}.`);
      }
    });
    if (![...asArray(item.evidenceIds), ...asArray(item.sourceIds)].length) {
      addIssue(issues, "toolkit_without_evidence", `${itemPath}.evidenceIds`, "Toolkit item should reference evidenceIds/sourceIds.");
    }
  });

  const fullReport = transportBrief.fullReport || transportReport;
  if (!isRecord(fullReport)) {
    addIssue(issues, "missing_full_report", "transportBrief.fullReport", "Transport payload should preserve a full report or transportReport object for rich guide rendering.");
  } else {
    const sections = asArray(fullReport.sections);
    if (!hasText(fullReport.summary) && sections.length === 0) {
      addIssue(issues, "empty_full_report", "transportBrief.fullReport", "Full report needs a summary or sections.");
    }
  }

  const cardOrContactlessRequired = transportBrief.paymentReadiness?.cardOrContactlessRequired;
  if (
    typeof cardOrContactlessRequired !== "undefined" &&
    !paymentRequiredValues.has(cardOrContactlessRequired) &&
    !paymentRequiredValues.has(String(cardOrContactlessRequired).toLowerCase())
  ) {
    addIssue(issues, "invalid_payment_required", "transportBrief.paymentReadiness.cardOrContactlessRequired", "Use yes, no, unknown, true, or false for cardOrContactlessRequired.");
  }

  if (transportReport && !isRecord(transportReport)) {
    addIssue(issues, "invalid_transport_report", "transportReport", "transportReport must be an object when present.");
  }

  return { ok: issues.length === 0, issues };
};

export const formatTransportPayloadIssues = (issues) => issues
  .map((issue) => `- [${issue.code}] ${issue.path}: ${issue.message}`)
  .join("\n");

const isDirectRun = path.basename(process.argv[1] || "") === "validate-transport-payload.mjs";

if (isDirectRun) {
  const sourcePath = process.argv[2];
  if (!sourcePath) {
    console.error("Usage: node scripts/validate-transport-payload.mjs <payload.json>");
    process.exit(2);
  }

  const payload = JSON.parse(fs.readFileSync(path.resolve(sourcePath), "utf8"));
  const result = validateTransportPayload(payload, { today: process.env.TRANSPORT_VALIDATION_TODAY });

  if (!result.ok) {
    console.error("Transport payload validation failed:");
    console.error(formatTransportPayloadIssues(result.issues));
    process.exit(1);
  }

  console.log(JSON.stringify({
    ok: true,
    message: "Transport payload validation passed.",
  }, null, 2));
}

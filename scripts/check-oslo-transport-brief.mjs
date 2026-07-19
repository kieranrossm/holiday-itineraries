import { createClient } from "@sanity/client";
import {
  formatTransportPayloadIssues,
  validateTransportPayload,
} from "./validate-transport-payload.mjs";

const slug = process.argv[2] || "oslo-september-2026";

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID || "943oi1hw",
  dataset: process.env.SANITY_DATASET || "production",
  apiVersion: process.env.SANITY_API_VERSION || "2025-02-19",
  useCdn: false,
  token: process.env.SANITY_READ_TOKEN || process.env.SANITY_WRITE_TOKEN,
});

const data = await client.fetch(
  `*[_type == "trip" && slug.current == $slug][0]{
    title,
    "slug": slug.current,
    transportBrief
  }`,
  { slug },
);

if (!data?.transportBrief) {
  throw new Error(`No transportBrief found for slug "${slug}".`);
}

const validation = validateTransportPayload({ transportBrief: data.transportBrief }, {
  today: process.env.TRANSPORT_VALIDATION_TODAY,
});

const airportArrival = data.transportBrief.airportArrival || [];
const cityTravel = data.transportBrief.cityTravel || [];
const toolkit = data.transportBrief.toolkit || [];
const sources = data.transportBrief.sources || [];
const fullReportSections = data.transportBrief.fullReport?.sections || [];

const summary = {
  title: data.title,
  slug: data.slug,
  validation: validation.ok ? "passed" : "failed",
  airportArrival: airportArrival.length,
  cityTravel: cityTravel.length,
  toolkit: toolkit.length,
  sources: sources.length,
  fullReportSections: fullReportSections.length,
  airportCardsWithServiceWindow: airportArrival.filter((item) => item.serviceWindow).length,
  cityCardsWithQualifiers: cityTravel.filter((item) => (
    item.coverageQualifier ||
    item.passQualifier ||
    item.ticketQualifier ||
    item.seasonality ||
    item.lateNightNote ||
    item.bestFor
  )).length,
  toolkitItemsWithUrls: toolkit.filter((item) => item.url).length,
  paymentReadiness: {
    cardOrContactlessRequired: data.transportBrief.paymentReadiness?.cardOrContactlessRequired,
    appPaymentSupported: data.transportBrief.paymentReadiness?.appPaymentSupported,
  },
};

if (!validation.ok) {
  console.error(JSON.stringify(summary, null, 2));
  console.error("Transport payload validation failed:");
  console.error(formatTransportPayloadIssues(validation.issues));
  process.exit(1);
}

console.log(JSON.stringify(summary, null, 2));

type TripStatusInput = {
  bookingActions: number;
  daysUntil: number | null;
};

export const toDisplayClass = (value: string | undefined, fallback = "") => {
  if (!value) return fallback;

  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || fallback;
};

export const DECISION_STATE_LABELS: Record<string, string> = {
  booked: "Booked",
  "to-book": "To book",
  maybe: "Maybe",
  backup: "Backup",
  "avoid-if-tired": "Avoid if tired",
  "weather-dependent": "Weather dependent",
  "must-do": "Must do",
};

export const getDecisionStateLabel = (decisionStatus: string | undefined) => {
  return decisionStatus ? DECISION_STATE_LABELS[decisionStatus] || "" : "";
};

export const getDecisionStateClass = (decisionStatus: string | undefined) => {
  return toDisplayClass(decisionStatus);
};

export const getCategoryClass = (category: string | undefined) => {
  return toDisplayClass(category, "other");
};

export const PRICE_VIBE_LABELS: Record<string, string> = {
  budget: "\u00a3",
  "mid-range": "\u00a3\u00a3",
  splurge: "\u00a3\u00a3\u00a3",
};

export const getPriceLabel = (priceVibe: string | undefined) => {
  return priceVibe ? PRICE_VIBE_LABELS[priceVibe] || "" : "";
};

export const getTripStatusInfo = ({ bookingActions, daysUntil }: TripStatusInput) => {
  if (bookingActions > 0) {
    return { label: "Open actions", className: "open-actions" };
  }

  if (daysUntil !== null && daysUntil < 0) {
    return { label: "In archive", className: "in-archive" };
  }

  if (daysUntil !== null && daysUntil <= 30) {
    return { label: "Coming soon", className: "coming-soon" };
  }

  return { label: "Planning", className: "planning" };
};

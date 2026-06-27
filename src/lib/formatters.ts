type Cost = {
  localAmount?: number;
  currencyType?: string;
  textFallback?: string;
};

type OpeningHours = {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
};

const EXCHANGE_RATES: Record<string, number> = {
  EUR: 0.85,
  CNY: 0.11,
  JPY: 0.0052,
  CHF: 0.88,
  GBP: 1.0,
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: "\u20ac",
  CNY: "\u00a5",
  JPY: "\u00a5",
  CHF: "CHF ",
  GBP: "\u00a3",
};

export const formatCost = (costObj: Cost | undefined) => {
  if (!costObj) return "";
  const { localAmount, currencyType, textFallback } = costObj;

  if (localAmount !== undefined && localAmount !== null) {
    const symbol = CURRENCY_SYMBOLS[currencyType || ""] || "\u00a3";
    const localFormatted = `${symbol}${localAmount.toLocaleString("en-GB")}`;

    if (currencyType === "GBP") return localFormatted;

    const rate = EXCHANGE_RATES[currencyType || ""] || 1;
    const gbpEquivalent = Math.round(localAmount * rate);
    return `${localFormatted} (\u00a3${gbpEquivalent.toLocaleString("en-GB")})`;
  }

  return textFallback || "";
};

export const formatDate = (dateString: string) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export const formatInlineDate = (dateString: string) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const getOpeningHourRows = (openingHours: OpeningHours | undefined) => {
  if (!openingHours) return [];

  const rows = [
    ["Mon", openingHours.monday],
    ["Tue", openingHours.tuesday],
    ["Wed", openingHours.wednesday],
    ["Thu", openingHours.thursday],
    ["Fri", openingHours.friday],
    ["Sat", openingHours.saturday],
    ["Sun", openingHours.sunday],
  ];

  return rows.filter(([, hours]) => Boolean(hours));
};

export const getPluralLabel = (count: number, singular: string, plural: string) => {
  return count === 1 ? singular : plural;
};

import type { MapPoint } from "./maps";
import { formatInlineDate } from "./formatters";

type Coordinates = {
  lat?: number;
  lng?: number;
};

type DateRange = {
  checkIn?: string;
  checkOut?: string;
  nights?: number;
};

export type HotelSourceLink = {
  platform: string;
  url?: string;
  nightlyPrice?: number;
  priceCurrency?: string;
  regionLocked?: boolean;
};

export type HotelCandidate = {
  rank?: number;
  propertyName?: string;
  propertyType?: string;
  area?: string;
  image?: {
    url?: string;
    alt?: string;
    source?: string;
  };
  sources?: { platform?: string; url?: string; nightlyPrice?: number; priceCurrency?: string; regionLocked?: boolean }[];
  review?: {
    scorePercent?: number;
    reviewCount?: number;
    source?: string;
  };
  price?: {
    perNight?: number;
    currency?: string;
    source?: string;
    multipleSources?: boolean;
    sourceRegionLocked?: boolean;
    budgetStatus?: string;
    overTargetAmount?: number;
    overFlexAmount?: number;
    checkedAt?: string;
  };
  distance?: {
    fromReferenceLabel?: string;
    walkingMinutes?: number;
    walkingMeters?: number;
    source?: string;
    checkedAt?: string;
  };
  amenities?: {
    airConditioning?: boolean | null;
    pool?: boolean | null;
    fridge?: boolean | null;
  };
  coordinates?: Coordinates;
  notes?: string[];
  booked?: boolean;
  flags?: string[];
};

export type HotelExclusion = {
  propertyName?: string;
  reason?: string;
};

export type HotelBookingOutcome = {
  bookedPropertyName?: string;
  bookedAt?: string;
  matchedTopPick?: boolean;
  whyNote?: string;
  actualPricePerNight?: number;
};

export type HotelStayReview = {
  reviewedAt?: string;
  matchedExpectations?: boolean;
  whatWorked?: string;
  whatDidnt?: string;
  wouldReturn?: "yes" | "no" | "unsure";
};

export type AvailabilityPreviewHotel = {
  propertyName?: string;
  source?: { platform?: string; url?: string };
  price?: { perNight?: number; currency?: string };
  review?: { scorePercent?: number; reviewCount?: number };
  distance?: { walkingMinutes?: number; fromReferenceLabel?: string };
  coordinates?: Coordinates;
};

export type AvailabilityPreview = {
  note?: string;
  dateRange?: DateRange;
  hotels?: AvailabilityPreviewHotel[];
};

export type HotelSearch = {
  title?: string;
  slug?: string;
  status?: string;
  search?: {
    location?: {
      label?: string;
      country?: string;
      geo?: Coordinates;
    };
    referencePoint?: {
      type?: string;
      label?: string;
      geo?: Coordinates;
    };
    dateRange?: {
      checkIn?: string;
      checkOut?: string;
      nights?: number;
    };
    guests?: {
      adults?: number;
      children?: number;
      rooms?: number;
    };
    budget?: {
      currency?: string;
      targetPerNight?: number;
      flexPerNight?: number;
    };
  };
  summary?: {
    headline?: string;
    bestOverallHotelName?: string;
    notes?: string[];
  };
  hotels?: HotelCandidate[];
  exclusions?: HotelExclusion[];
  bookingOutcome?: HotelBookingOutcome;
  stayReview?: HotelStayReview;
  availabilityPreview?: AvailabilityPreview;
  metadata?: {
    searchedAt?: string;
    dataFreshness?: string;
    resultStatus?: string;
  };
};

export const propertyTypeLabels: Record<string, string> = {
  hotel: "Hotel",
  aparthotel: "Aparthotel",
  self_catering: "Self-catering",
  apartment: "Apartment",
  villa: "Villa",
  guesthouse: "Guesthouse",
  resort: "Resort",
  hostel: "Hostel",
  unknown: "Unknown",
};

export const budgetStatusLabels: Record<string, string> = {
  within: "Within Budget",
  flex: "Within Flex",
  over: "Over Budget",
  unknown: "Budget Unknown",
};

// 2026-07-17 (Kieran's call): filters became soft labels instead of hard
// cutoffs in the gather pipeline — a property that would previously have
// been excluded now survives with a flag instead. These are the
// human-readable labels for those flags; a few (required-amenity-absent:X,
// X-required-unconfirmed) are dynamic and handled in getFlagLabel below
// rather than listed here individually.
export const flagLabels: Record<string, string> = {
  "below-review-threshold": "Below review threshold",
  "over-budget": "Over budget",
  "over-target-within-flex": "Over target, within flex",
  "far-walk": "Far walk",
  "longer-walk": "Longer walk than usual",
  "no-review-data": "No review data",
  "price-not-comparable-to-budget": "Price not comparable to budget",
  "distance-estimated": "Distance estimated, not routed",
  "pin-conflict": "Sources disagree on location",
  "shared-pin-suspect": "Location pin may be inexact",
  "possible-duplicate-unresolved": "Possible duplicate, unresolved",
  "google-places-only": "Found via Google Maps only, not yet on a booking site",
  "price-disagreement": "Sources disagree on price — see per-source prices below",
};

export const getFlagLabel = (flag: string): string => {
  if (flagLabels[flag]) return flagLabels[flag];

  const absentMatch = flag.match(/^required-amenity-absent:(.+)$/);
  if (absentMatch) return `${absentMatch[1]} required but absent`;

  const unconfirmedMatch = flag.match(/^(.+)-required-unconfirmed$/);
  if (unconfirmedMatch) return `${unconfirmedMatch[1]} required, unconfirmed`;

  // Fallback so a new/unmapped flag is still readable, never silently
  // dropped — same "nothing is silently dropped" rule the pipeline itself
  // follows for exclusions.
  return flag.replaceAll(/[-_]/g, " ").replace(/^./, (c) => c.toUpperCase());
};

export const hasNumber = (value: unknown): value is number => (
  typeof value === "number" && Number.isFinite(value)
);

export const getPropertyTypeLabel = (value: unknown) => {
  const key = typeof value === "string" && value ? value : "unknown";
  return propertyTypeLabels[key] || key.replaceAll("_", " ");
};

export const getBudgetStatusLabel = (value: unknown) => {
  const key = typeof value === "string" && value ? value : "unknown";
  return budgetStatusLabels[key] || "Budget Unknown";
};

export const wouldReturnLabels: Record<string, string> = {
  yes: "Would return",
  no: "Would not return",
  unsure: "Unsure about returning",
};

export const getWouldReturnLabel = (value: unknown) => {
  const key = typeof value === "string" && value ? value : "";
  return wouldReturnLabels[key] || "";
};

export const getBudgetStatusClass = (value: unknown) => {
  const key = typeof value === "string" && value ? value : "unknown";
  if (key === "within") return "within";
  if (key === "flex") return "flex";
  if (key === "over") return "over";
  return "unknown";
};

export const formatMoney = (value: unknown, currency = "GBP") => {
  if (!hasNumber(value)) return "";

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency || "GBP",
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatPerNight = (hotel: HotelCandidate, fallbackCurrency = "GBP") => {
  const currency = hotel.price?.currency || fallbackCurrency;
  const value = hotel.price?.perNight;
  const money = formatMoney(value, currency);

  return money ? `${money}/night` : "Price not confirmed";
};

export const formatDateRange = (dateRange: DateRange | undefined) => {
  const checkIn = dateRange?.checkIn ? formatInlineDate(dateRange.checkIn) : "";
  const checkOut = dateRange?.checkOut ? formatInlineDate(dateRange.checkOut) : "";
  const nights = hasNumber(dateRange?.nights) ? `${dateRange.nights} ${dateRange.nights === 1 ? "night" : "nights"}` : "";

  return [checkIn && checkOut ? `${checkIn} to ${checkOut}` : checkIn || checkOut, nights].filter(Boolean).join(" - ");
};

export const formatReview = (hotel: HotelCandidate) => {
  const score = hasNumber(hotel.review?.scorePercent) ? `${hotel.review?.scorePercent}%` : "";
  const count = hasNumber(hotel.review?.reviewCount) ? `(${hotel.review?.reviewCount?.toLocaleString("en-GB")})` : "";

  return [score, count].filter(Boolean).join(" ") || "Review not confirmed";
};

export const formatWalk = (hotel: HotelCandidate) => {
  const minutes = hotel.distance?.walkingMinutes;
  if (!hasNumber(minutes)) return "Walk not confirmed";

  return `${minutes} min`;
};

export const formatAmenity = (value: boolean | null | undefined) => {
  if (value === true) return "Yes";
  if (value === false) return "No";
  return "Unknown";
};

export const formatCheckedDate = (value: unknown) => {
  if (typeof value !== "string" || !value) return "";

  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const getHotelSourceLinks = (hotel: HotelCandidate): HotelSourceLink[] => (
  (hotel.sources || [])
    .filter((source) => source?.platform || source?.url)
    .map((source) => ({
      platform: source.platform || "Listing",
      url: source.url,
      nightlyPrice: source.nightlyPrice,
      priceCurrency: source.priceCurrency,
      regionLocked: source.regionLocked,
    }))
);

// 2026-07-18 (Kieran's call): a per-source pricing table, cheapest first, so
// he can see and choose between prices himself rather than the pipeline
// picking one "canonical" number and hiding the rest. Region-locked sources
// (e.g. Expedia, see sanity.config.ts hotelSourceFields.regionLocked) are
// NOT excluded or sorted last — Kieran confirmed via his own VPN that a
// region-locked price is genuinely bookable and can be the cheapest.
export const getHotelPricingTable = (hotel: HotelCandidate): HotelSourceLink[] => (
  getHotelSourceLinks(hotel)
    .filter((source) => hasNumber(source.nightlyPrice))
    .sort((first, second) => (first.nightlyPrice as number) - (second.nightlyPrice as number))
);

export const getHotelPrimaryUrl = (hotel: HotelCandidate) => (
  (hotel.sources || []).find((source) => source?.url)?.url || ""
);

export const getHotelImageUrl = (hotel: HotelCandidate) => hotel.image?.url || "";

export const getBudgetDeltaLabel = (hotel: HotelCandidate, targetPerNight?: number, flexPerNight?: number) => {
  const perNight = hotel.price?.perNight;
  const currency = hotel.price?.currency || "GBP";

  if (!hasNumber(perNight)) return "";
  if (hasNumber(targetPerNight) && perNight <= targetPerNight) return "At or below target";
  if (hasNumber(targetPerNight) && hasNumber(flexPerNight) && perNight <= flexPerNight) {
    return `${formatMoney(perNight - targetPerNight, currency)} over target`;
  }
  if (hasNumber(flexPerNight) && perNight > flexPerNight) {
    return `${formatMoney(perNight - flexPerNight, currency)} over flex`;
  }
  if (hasNumber(targetPerNight)) return `${formatMoney(perNight - targetPerNight, currency)} over target`;

  return "";
};

export const getSortedHotels = (hotels: HotelCandidate[]) => (
  [...(hotels || [])].sort((first, second) => {
    const firstRank = hasNumber(first.rank) ? first.rank : Number.POSITIVE_INFINITY;
    const secondRank = hasNumber(second.rank) ? second.rank : Number.POSITIVE_INFINITY;

    return firstRank - secondRank || String(first.propertyName || "").localeCompare(String(second.propertyName || ""));
  })
);

export const formatPreviewPrice = (hotel: AvailabilityPreviewHotel, fallbackCurrency = "GBP") => {
  const currency = hotel?.price?.currency || fallbackCurrency;
  const money = formatMoney(hotel?.price?.perNight, currency);

  return money ? `${money}/night` : "Price not confirmed";
};

export const formatPreviewReview = (hotel: AvailabilityPreviewHotel) => {
  const score = hasNumber(hotel?.review?.scorePercent) ? `${hotel.review?.scorePercent}%` : "";
  const count = hasNumber(hotel?.review?.reviewCount) ? `(${hotel.review?.reviewCount?.toLocaleString("en-GB")})` : "";

  return [score, count].filter(Boolean).join(" ") || "Review not confirmed";
};

export const formatPreviewWalk = (hotel: AvailabilityPreviewHotel) => {
  const minutes = hotel?.distance?.walkingMinutes;
  return hasNumber(minutes) ? `${minutes} min` : "Walk not confirmed";
};

export const getHotelMapPoints = (hotelSearch: HotelSearch): MapPoint[] => {
  const points: MapPoint[] = [];
  const reference = hotelSearch.search?.referencePoint;

  if (hasNumber(reference?.geo?.lat) && hasNumber(reference?.geo?.lng)) {
    points.push({
      name: reference?.label || "Reference point",
      type: "Reference",
      lat: reference.geo.lat,
      lng: reference.geo.lng,
      markerColor: "black",
    });
  }

  getSortedHotels(hotelSearch.hotels || [])
    .filter((hotel) => hasNumber(hotel.coordinates?.lat) && hasNumber(hotel.coordinates?.lng))
    .slice(0, 24)
    .forEach((hotel) => {
      const budgetStatus = hotel.price?.budgetStatus || "unknown";
      const markerColor = budgetStatus === "within"
        ? "green"
        : budgetStatus === "flex"
          ? "yellow"
          : budgetStatus === "over"
            ? "red"
            : "blue";

      points.push({
        name: hotel.propertyName || "Hotel",
        type: getPropertyTypeLabel(hotel.propertyType),
        category: getBudgetStatusLabel(budgetStatus),
        area: hotel.area || "",
        lat: hotel.coordinates?.lat as number,
        lng: hotel.coordinates?.lng as number,
        markerColor,
        mapUrl: getHotelPrimaryUrl(hotel),
        hotelRank: hotel.rank,
        priceLabel: formatPerNight(hotel, hotelSearch.search?.budget?.currency || "GBP"),
      });
    });

  (hotelSearch.availabilityPreview?.hotels || [])
    .filter((hotel) => hasNumber(hotel.coordinates?.lat) && hasNumber(hotel.coordinates?.lng))
    .forEach((hotel, index) => {
      points.push({
        name: hotel.propertyName || "Preview hotel",
        type: "Availability preview",
        category: "Reference only — not your travel dates",
        lat: hotel.coordinates?.lat as number,
        lng: hotel.coordinates?.lng as number,
        markerColor: "purple",
        mapUrl: hotel.source?.url || "",
        previewKey: String(index),
        priceLabel: formatPreviewPrice(hotel, hotelSearch.search?.budget?.currency || "GBP"),
      });
    });

  return points;
};

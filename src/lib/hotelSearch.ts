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
  sources?: { platform?: string; url?: string }[];
  review?: {
    scorePercent?: number;
    reviewCount?: number;
    source?: string;
  };
  price?: {
    perNight?: number;
    currency?: string;
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
  };
  coordinates?: Coordinates;
  notes?: string[];
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
    .map((source) => ({ platform: source.platform || "Listing", url: source.url }))
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
      });
    });

  return points;
};

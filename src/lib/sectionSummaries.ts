import { isTransitCategory } from "./itineraryStats";
import { hasWeatherConfig } from "./weather";

type Coordinates = {
  lat?: number;
  lng?: number;
};

type ItineraryPlace = {
  area?: string;
  category?: string;
  coordinates?: Coordinates;
  decisionStatus?: string;
  paymentStatus?: string;
  bookingLogistics?: {
    bookingStatus?: string;
  };
};

type FoodOption = {
  area?: string;
  coordinates?: Coordinates;
  decisionStatus?: string;
};

type WeatherConfig = {
  enabled?: boolean;
  latitude?: number;
  longitude?: number;
};

type ItinerarySection = {
  places?: ItineraryPlace[];
  foodShortlist?: FoodOption[];
  weatherConfig?: WeatherConfig;
};

export const getBookingActionCount = (section: ItinerarySection) => {
  return (section.places || []).filter((place) => place.bookingLogistics?.bookingStatus === "to-book").length;
};

export const getSectionAreaLabel = (section: ItinerarySection) => {
  const areas = [
    ...(section.places || []).map((place) => place.area),
    ...(section.foodShortlist || []).map((food) => food.area),
  ].filter(Boolean);
  const uniqueAreas = [...new Set(areas)];

  if (uniqueAreas.length === 0) return "";
  if (uniqueAreas.length <= 2) return uniqueAreas.join(" / ");

  return `${uniqueAreas[0]} + ${uniqueAreas.length - 1} areas`;
};

export const getSectionScanItems = (section: ItinerarySection) => {
  const places = section.places || [];
  const foods = section.foodShortlist || [];
  const bookingActions = getBookingActionCount(section);
  const transitCount = places.filter((place) => isTransitCategory(place.category)).length;
  const unpaidItems = places.filter((place) => (
    place.paymentStatus === "unpaid" &&
    place.bookingLogistics?.bookingStatus === "booked"
  )).length;
  const mappedCount = [
    ...places.filter((place) => typeof place.coordinates?.lat === "number" && typeof place.coordinates?.lng === "number"),
    ...foods.filter((food) => typeof food.coordinates?.lat === "number" && typeof food.coordinates?.lng === "number"),
  ].length;
  const decisionActions = [...places, ...foods].filter((item) => (
    item.decisionStatus === "maybe" ||
    item.decisionStatus === "backup" ||
    item.decisionStatus === "weather-dependent"
  )).length;
  const areaLabel = getSectionAreaLabel(section);

  return [
    places.length ? `${places.length} ${places.length === 1 ? "stop" : "stops"}` : "",
    foods.length ? `${foods.length} ${foods.length === 1 ? "food option" : "food options"}` : "",
    transitCount ? `${transitCount} ${transitCount === 1 ? "transit item" : "transit items"}` : "",
    bookingActions ? `${bookingActions} to book` : "",
    unpaidItems ? `${unpaidItems} unpaid` : "",
    mappedCount ? `${mappedCount} mapped` : "",
    areaLabel ? `Area: ${areaLabel}` : "",
    hasWeatherConfig(section.weatherConfig) ? "Weather on" : "",
    decisionActions ? `${decisionActions} decision ${decisionActions === 1 ? "flag" : "flags"}` : "",
  ].filter(Boolean);
};

export const getSectionSummary = (section: ItinerarySection) => {
  const placeCount = section.places?.length || 0;
  const foodCount = section.foodShortlist?.length || 0;
  const bookingActions = getBookingActionCount(section);

  if (placeCount === 0 && foodCount > 0) {
    return `${foodCount} ${foodCount === 1 ? "restaurant option" : "restaurant options"}`;
  }

  if (placeCount === 0) return "Plans still taking shape";

  const itemLabel = placeCount === 1 ? "stop" : "stops";
  const bookingSummary = bookingActions === 0
    ? "No booking actions"
    : `${bookingActions} ${bookingActions === 1 ? "booking action" : "booking actions"}`;
  return `${placeCount} ${itemLabel} mapped \u2022 ${bookingSummary}`;
};

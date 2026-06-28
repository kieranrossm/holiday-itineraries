type Coordinates = {
  lat?: number;
  lng?: number;
};

type ItineraryPlace = {
  category?: string;
  coordinates?: Coordinates;
  countAsStop?: boolean;
  showOnDashboardMap?: boolean;
  bookingLogistics?: {
    bookingStatus?: string;
  };
  paymentStatus?: string;
};

type FoodOption = {
  coordinates?: Coordinates;
  bookingStatus?: string;
};

type ItinerarySection = {
  sectionTitle?: string;
  places?: ItineraryPlace[];
  foodShortlist?: FoodOption[];
};

type ItineraryTrip = {
  sections?: ItinerarySection[];
};

export const isTransitCategory = (category: string | undefined) => {
  return category === "Transit";
};

export const isTravelSection = (sectionTitle: string | undefined) => {
  return /travel|transit|transport/i.test(sectionTitle || "");
};

export const countsAsDashboardStop = (place: ItineraryPlace, sectionTitle?: string) => {
  if (place?.countAsStop === true) return true;
  if (place?.countAsStop === false) return false;
  if (isTravelSection(sectionTitle)) return false;

  return !isTransitCategory(place?.category);
};

export const showsOnDashboardMap = (place: ItineraryPlace, sectionTitle?: string) => {
  if (place?.showOnDashboardMap === true) return true;
  if (place?.showOnDashboardMap === false) return false;

  return countsAsDashboardStop(place, sectionTitle);
};

export const hasCoordinates = (item: { coordinates?: Coordinates }) => {
  return typeof item?.coordinates?.lat === "number" && typeof item?.coordinates?.lng === "number";
};

export const getTripStats = (trip: ItineraryTrip) => {
  const sections = trip.sections || [];
  const places = sections.flatMap((section) => section.places || []);
  const foods = sections.flatMap((section) => section.foodShortlist || []);
  const bookingActions = [
    ...places.filter((place) => place.bookingLogistics?.bookingStatus === "to-book"),
    ...foods.filter((food) => food.bookingStatus === "consider-booking"),
  ];
  const mappedItems = [
    ...places.filter(hasCoordinates),
    ...foods.filter(hasCoordinates),
  ];
  const stops = sections.flatMap((section) => (
    (section.places || []).filter((place) => countsAsDashboardStop(place, section.sectionTitle))
  ));

  return {
    sections: sections.length,
    stops: stops.length,
    food: foods.length,
    bookingActions: bookingActions.length,
    mapped: mappedItems.length,
  };
};

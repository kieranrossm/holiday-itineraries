import { isTransitCategory, showsOnDashboardMap } from "./itineraryStats";

type Coordinates = {
  lat?: number;
  lng?: number;
};

type FoodOption = {
  name?: string;
  foodType?: string;
  area?: string;
  coordinates?: Coordinates;
  mapUrl?: string;
  showOnDashboardMap?: boolean;
};

type ItineraryPlace = {
  placeName?: string;
  category?: string;
  coordinates?: Coordinates;
  showOnDashboardMap?: boolean;
  countAsStop?: boolean;
};

type ItinerarySection = {
  sectionTitle?: string;
  places?: ItineraryPlace[];
  foodShortlist?: FoodOption[];
};

export type MapPoint = {
  name: string;
  lat: number;
  lng: number;
  markerColor?: string;
  type?: string;
  area?: string;
  category?: string;
  foodType?: string;
  mapUrl?: string;
  showOnDashboardMap?: boolean;
  sectionTitle?: string;
};

export const getCoordinateMapUrl = (coordinates: Coordinates | undefined) => {
  if (typeof coordinates?.lat !== "number" || typeof coordinates?.lng !== "number") return "";

  return `https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`;
};

export const getFoodMapPoints = (foods: FoodOption[]) => {
  return (foods || [])
    .filter((food) => typeof food.coordinates?.lat === "number" && typeof food.coordinates?.lng === "number")
    .map((food) => ({
      name: food.name || "Restaurant",
      foodType: food.foodType || "",
      area: food.area || "",
      lat: food.coordinates?.lat as number,
      lng: food.coordinates?.lng as number,
      mapUrl: food.mapUrl || "",
      showOnDashboardMap: food.showOnDashboardMap,
      markerColor: "red",
      type: "Food",
    }));
};

export const getTripMapPoints = (sections: ItinerarySection[]) => {
  return (sections || []).flatMap((section) => {
    const placePoints = (section.places || [])
      .filter((place) => (
        showsOnDashboardMap(place, section.sectionTitle) &&
        typeof place.coordinates?.lat === "number" &&
        typeof place.coordinates?.lng === "number"
      ))
      .map((place) => {
        const category = place.category || "Place";
        const markerColor = category === "Hotel"
          ? "purple"
          : isTransitCategory(category)
            ? "orange"
            : "blue";

        return {
          name: place.placeName || "Stop",
          sectionTitle: section.sectionTitle || "",
          category,
          lat: place.coordinates?.lat as number,
          lng: place.coordinates?.lng as number,
          markerColor,
          type: category,
        };
      });

    const foodPoints = getFoodMapPoints(section.foodShortlist || [])
      .filter((foodPoint) => foodPoint.showOnDashboardMap !== false)
      .map((foodPoint) => ({
        ...foodPoint,
        sectionTitle: section.sectionTitle || "",
      }));

    return [...placePoints, ...foodPoints];
  });
};

export const getSectionMapId = (sectionTitle: string | undefined, index: number) => {
  const titleSlug = (sectionTitle || "restaurants")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `food-map-${titleSlug || "section"}-${index}`;
};

export const getStaticMapUrl = (points: MapPoint[], apiKey: string) => {
  if (!apiKey || points.length === 0) return "";

  const labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const url = new URL("https://maps.googleapis.com/maps/api/staticmap");
  url.searchParams.set("size", "640x360");
  url.searchParams.set("scale", "2");
  url.searchParams.set("maptype", "roadmap");
  url.searchParams.set("key", apiKey);

  points.forEach((point, index) => {
    const label = labels[index] || "";
    const markerParts = [`color:${point.markerColor || "red"}`];

    if (label) {
      markerParts.push(`label:${label}`);
    }

    markerParts.push(`${point.lat},${point.lng}`);
    url.searchParams.append("markers", markerParts.join("|"));
  });

  return url.toString();
};

export const getFoodStaticMapUrl = (points: MapPoint[], apiKey: string) => getStaticMapUrl(points, apiKey);

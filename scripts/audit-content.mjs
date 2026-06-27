import { createClient } from "@sanity/client";

const client = createClient({
  projectId: "943oi1hw",
  dataset: "production",
  apiVersion: "2025-01-01",
  useCdn: false,
});

const hasNumber = (value) => typeof value === "number" && Number.isFinite(value);
const hasCoordinates = (item) => hasNumber(item?.coordinates?.lat) && hasNumber(item?.coordinates?.lng);
const hasWeatherCoordinates = (weatherConfig) => (
  hasNumber(weatherConfig?.latitude) && hasNumber(weatherConfig?.longitude)
);

const addIssue = (issues, severity, location, message) => {
  issues.push({ severity, location, message });
};

const trips = await client.fetch(`*[_type == "trip"] | order(startDate asc) {
  title,
  "slug": slug.current,
  startDate,
  displayStatus,
  heroIntro,
  "hasHeroImage": defined(heroImage.asset),
  weatherConfig {
    enabled,
    locationLabel,
    latitude,
    longitude,
    "hasIconSetRef": defined(iconSetRef._ref),
    "hasLegacyIconSet": defined(iconSet)
  },
  sections[] {
    sectionTitle,
    sectionIntro,
    "hasSectionImage": defined(sectionImage.asset),
    layoutStyle,
    initialLoadState,
    weatherConfig {
      enabled,
      locationLabel,
      latitude,
      longitude
    },
    foodShortlist[] {
      name,
      foodType,
      area,
      shortNote,
      bookingStatus,
      websiteUrl,
      mapUrl,
      coordinates,
      "hasImage": defined(image.asset),
      openingHours
    },
    places[] {
      placeName,
      category,
      area,
      shortDescription,
      bookingUrl,
      websiteUrl,
      coordinates,
      "hasPhoto": defined(photo.asset),
      bookingLogistics,
      paymentStatus
    }
  }
}`);

const issues = [];
const summaries = [];

for (const trip of trips) {
  const tripLabel = trip.title || trip.slug || "Untitled trip";
  const sections = trip.sections || [];
  const places = sections.flatMap((section) => section.places || []);
  const foods = sections.flatMap((section) => section.foodShortlist || []);

  summaries.push({
    title: tripLabel,
    visibility: trip.displayStatus || "visible",
    sections: sections.length,
    places: places.length,
    foodAndDrink: foods.length,
  });

  if (!trip.slug) addIssue(issues, "error", tripLabel, "Trip is missing a slug.");
  if (!trip.startDate) addIssue(issues, "warning", tripLabel, "Trip is missing a start date.");
  if (!trip.heroIntro) addIssue(issues, "info", tripLabel, "Trip is missing a hero intro.");
  if (!trip.hasHeroImage) addIssue(issues, "info", tripLabel, "Trip is missing a hero image.");
  if (!sections.length) addIssue(issues, "warning", tripLabel, "Trip has no sections.");

  if (trip.weatherConfig?.enabled) {
    if (!hasWeatherCoordinates(trip.weatherConfig)) {
      addIssue(issues, "warning", `${tripLabel} > trip weather`, "Weather is enabled without latitude/longitude.");
    }
    if (!trip.weatherConfig.hasIconSetRef && !trip.weatherConfig.hasLegacyIconSet) {
      addIssue(issues, "info", `${tripLabel} > trip weather`, "Weather has no shared icon set configured.");
    }
  }

  for (const section of sections) {
    const sectionLabel = `${tripLabel} > ${section.sectionTitle || "Untitled section"}`;

    if (!section.sectionTitle) addIssue(issues, "error", sectionLabel, "Section is missing a title.");
    if (!section.layoutStyle) addIssue(issues, "warning", sectionLabel, "Section is missing layoutStyle.");
    if (!section.initialLoadState) addIssue(issues, "warning", sectionLabel, "Section is missing initialLoadState.");
    if (!section.sectionIntro) addIssue(issues, "info", sectionLabel, "Section is missing an intro.");
    if (!section.hasSectionImage) addIssue(issues, "info", sectionLabel, "Section is missing a banner image.");

    if (section.weatherConfig?.enabled && !hasWeatherCoordinates(section.weatherConfig)) {
      addIssue(issues, "warning", `${sectionLabel} > weather`, "Section weather is enabled without latitude/longitude.");
    }

    for (const place of section.places || []) {
      const placeLabel = `${sectionLabel} > ${place.placeName || "Untitled place"}`;

      if (!place.placeName) addIssue(issues, "error", placeLabel, "Place is missing a name.");
      if (!place.category) addIssue(issues, "warning", placeLabel, "Place is missing a category.");
      if (!place.shortDescription) addIssue(issues, "info", placeLabel, "Place is missing a short description.");
      if (!hasCoordinates(place)) addIssue(issues, "info", placeLabel, "Place is missing coordinates.");
      if (!place.hasPhoto) addIssue(issues, "info", placeLabel, "Place is missing a photo.");
      if (!place.websiteUrl && !place.bookingUrl) addIssue(issues, "info", placeLabel, "Place has no website or booking link.");
    }

    for (const food of section.foodShortlist || []) {
      const foodLabel = `${sectionLabel} > ${food.name || "Untitled food/drink"}`;

      if (!food.name) addIssue(issues, "error", foodLabel, "Food/drink item is missing a name.");
      if (!food.foodType) addIssue(issues, "info", foodLabel, "Food/drink item is missing foodType.");
      if (!food.shortNote) addIssue(issues, "info", foodLabel, "Food/drink item is missing a short note.");
      if (!hasCoordinates(food)) addIssue(issues, "info", foodLabel, "Food/drink item is missing coordinates.");
      if (!food.mapUrl && !hasCoordinates(food)) addIssue(issues, "info", foodLabel, "Food/drink item has no mapUrl or coordinates.");
      if (!food.websiteUrl) addIssue(issues, "info", foodLabel, "Food/drink item is missing a website URL.");
      if (!food.hasImage) addIssue(issues, "info", foodLabel, "Food/drink item is missing an image.");
    }
  }
}

const severityOrder = { error: 0, warning: 1, info: 2 };
issues.sort((first, second) => severityOrder[first.severity] - severityOrder[second.severity]);

console.log("Holiday itinerary content audit");
console.log("===============================");
console.log("");
console.log("Trip summary");
for (const summary of summaries) {
  console.log(`- ${summary.title} (${summary.visibility}): ${summary.sections} sections, ${summary.places} places, ${summary.foodAndDrink} food/drink`);
}

console.log("");
console.log("Issues");
if (!issues.length) {
  console.log("- No content issues found.");
} else {
  for (const issue of issues) {
    console.log(`- [${issue.severity}] ${issue.location}: ${issue.message}`);
  }
}

const errors = issues.filter((issue) => issue.severity === "error").length;
const warnings = issues.filter((issue) => issue.severity === "warning").length;
const info = issues.filter((issue) => issue.severity === "info").length;

console.log("");
console.log(`Totals: ${errors} errors, ${warnings} warnings, ${info} info`);

if (errors > 0) {
  process.exitCode = 1;
}

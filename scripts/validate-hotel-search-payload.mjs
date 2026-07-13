import fs from "node:fs";
import path from "node:path";

const propertyTypes = new Set([
  "hotel",
  "aparthotel",
  "self_catering",
  "apartment",
  "villa",
  "guesthouse",
  "resort",
  "hostel",
  "unknown",
]);

const budgetStatuses = new Set(["within", "flex", "over", "unknown"]);
const referenceTypes = new Set(["landmark", "location_center", "attraction", "beach", "station", "other"]);

const errors = [];
const warnings = [];

const inputPath = process.argv[2];

if (!inputPath) {
  console.error("Usage: node scripts/validate-hotel-search-payload.mjs <hotel-search.json>");
  process.exit(2);
}

const absolutePath = path.resolve(inputPath);
let payload;

try {
  payload = JSON.parse(fs.readFileSync(absolutePath, "utf8"));
} catch (error) {
  console.error(`Failed to read JSON: ${error.message}`);
  process.exit(2);
}

const isObject = (value) => Boolean(value && typeof value === "object" && !Array.isArray(value));
const isString = (value) => typeof value === "string" && value.trim().length > 0;
const isNumber = (value) => typeof value === "number" && Number.isFinite(value);
const isBooleanOrNull = (value) => value === true || value === false || value === null || value === undefined;

const addError = (pathLabel, message) => errors.push(`${pathLabel}: ${message}`);
const addWarning = (pathLabel, message) => warnings.push(`${pathLabel}: ${message}`);

const checkRequiredString = (value, pathLabel) => {
  if (!isString(value)) addError(pathLabel, "required string is missing");
};

const checkCoordinates = (value, pathLabel) => {
  if (!isObject(value)) {
    addError(pathLabel, "coordinates object is missing");
    return;
  }

  if (!isNumber(value.lat)) addError(`${pathLabel}.lat`, "latitude must be a number");
  if (!isNumber(value.lng)) addError(`${pathLabel}.lng`, "longitude must be a number");

  if (value._type !== "geopoint") {
    addWarning(pathLabel, "Sanity geopoint fields should include _type: \"geopoint\"");
  }
};

const slug = isObject(payload.slug) ? payload.slug.current : payload.slug;

if (payload._type !== "hotelSearch") addError("_type", "must be hotelSearch");
checkRequiredString(payload.title, "title");
checkRequiredString(slug, "slug.current");

if (payload.status && !["draft", "completed", "archived"].includes(payload.status)) {
  addError("status", "must be draft, completed, or archived");
}

if (!isObject(payload.search)) {
  addError("search", "required object is missing");
} else {
  checkRequiredString(payload.search.location?.label, "search.location.label");
  checkCoordinates(payload.search.location?.geo, "search.location.geo");

  checkRequiredString(payload.search.referencePoint?.label, "search.referencePoint.label");
  if (!referenceTypes.has(payload.search.referencePoint?.type)) {
    addError("search.referencePoint.type", `must be one of: ${Array.from(referenceTypes).join(", ")}`);
  }
  checkCoordinates(payload.search.referencePoint?.geo, "search.referencePoint.geo");

  checkRequiredString(payload.search.dateRange?.checkIn, "search.dateRange.checkIn");
  checkRequiredString(payload.search.dateRange?.checkOut, "search.dateRange.checkOut");
  if (!isNumber(payload.search.dateRange?.nights)) addError("search.dateRange.nights", "must be a number");

  checkRequiredString(payload.search.budget?.currency, "search.budget.currency");
  if (!isNumber(payload.search.budget?.targetPerNight)) addError("search.budget.targetPerNight", "must be a number");
  if (!isNumber(payload.search.budget?.flexPerNight)) addWarning("search.budget.flexPerNight", "flex budget is missing or not numeric");
}

if (!Array.isArray(payload.hotels)) {
  addError("hotels", "must be an array");
} else {
  const seenKeys = new Set();
  const target = payload.search?.budget?.targetPerNight;
  const flex = payload.search?.budget?.flexPerNight;

  payload.hotels.forEach((hotel, index) => {
    const pathPrefix = `hotels[${index}]`;

    if (!isObject(hotel)) {
      addError(pathPrefix, "must be an object");
      return;
    }

    checkRequiredString(hotel._key, `${pathPrefix}._key`);
    if (hotel._key && seenKeys.has(hotel._key)) addError(`${pathPrefix}._key`, "duplicate _key");
    if (hotel._key) seenKeys.add(hotel._key);

    if (hotel._type && hotel._type !== "hotelCandidate") {
      addError(`${pathPrefix}._type`, "must be hotelCandidate");
    }

    if (!isNumber(hotel.rank)) addWarning(`${pathPrefix}.rank`, "rank is missing or not numeric");
    checkRequiredString(hotel.propertyName, `${pathPrefix}.propertyName`);

    if (!propertyTypes.has(hotel.propertyType || "unknown")) {
      addError(`${pathPrefix}.propertyType`, `must be one of: ${Array.from(propertyTypes).join(", ")}`);
    }

    if (!Array.isArray(hotel.sources)) {
      addWarning(`${pathPrefix}.sources`, "sources should be an array");
    } else {
      hotel.sources.forEach((source, sourceIndex) => {
        const sourcePath = `${pathPrefix}.sources[${sourceIndex}]`;
        if (!isString(source?._key)) addWarning(`${sourcePath}._key`, "source _key is missing");
        if (!isString(source?.platform)) addWarning(`${sourcePath}.platform`, "source platform is missing");
        if (source?.url === null) addWarning(`${sourcePath}.url`, "source URL is null; omit it or provide a URL when available");
        if (!isString(source?.url)) addWarning(`${sourcePath}.url`, "source has no listing URL; the site can only link to it if a URL is provided");
      });
    }

    if (hotel.image !== undefined && !isString(hotel.image?.url)) {
      addWarning(`${pathPrefix}.image.url`, "image object is present but has no url; omit image entirely or provide a hosted photo URL");
    }

    if (!isNumber(hotel.review?.scorePercent)) addWarning(`${pathPrefix}.review.scorePercent`, "review score is missing or not numeric");
    if (!isNumber(hotel.review?.reviewCount)) addWarning(`${pathPrefix}.review.reviewCount`, "review count is missing or not numeric");

    if (!isNumber(hotel.price?.perNight)) addError(`${pathPrefix}.price.perNight`, "price per night must be numeric");
    if (!budgetStatuses.has(hotel.price?.budgetStatus || "unknown")) {
      addError(`${pathPrefix}.price.budgetStatus`, `must be one of: ${Array.from(budgetStatuses).join(", ")}`);
    }

    if (isNumber(hotel.price?.perNight) && isNumber(target)) {
      const expectedStatus = hotel.price.perNight <= target
        ? "within"
        : isNumber(flex) && hotel.price.perNight <= flex
          ? "flex"
          : isNumber(flex)
            ? "over"
            : hotel.price.budgetStatus;

      if (hotel.price?.budgetStatus && expectedStatus && hotel.price.budgetStatus !== expectedStatus) {
        addWarning(`${pathPrefix}.price.budgetStatus`, `expected ${expectedStatus} from budget thresholds`);
      }
    }

    if (!isNumber(hotel.distance?.walkingMinutes)) addWarning(`${pathPrefix}.distance.walkingMinutes`, "walking time is missing or not numeric");
    if (hotel.distance?.source !== "google_directions_api") {
      addWarning(`${pathPrefix}.distance.source`, "expected google_directions_api for routed walking times");
    }

    if (!isBooleanOrNull(hotel.amenities?.airConditioning)) {
      addError(`${pathPrefix}.amenities.airConditioning`, "must be true, false, null, or omitted");
    }
    if (!isBooleanOrNull(hotel.amenities?.pool)) {
      addError(`${pathPrefix}.amenities.pool`, "must be true, false, null, or omitted");
    }

    checkCoordinates(hotel.coordinates, `${pathPrefix}.coordinates`);
  });
}

if (!isObject(payload.metadata)) {
  addWarning("metadata", "metadata object is missing");
} else {
  checkRequiredString(payload.metadata.searchedAt, "metadata.searchedAt");
  if (payload.metadata.dataFreshness !== "snapshot") addWarning("metadata.dataFreshness", "expected snapshot");
}

console.log(`Hotel search payload: ${payload.title || absolutePath}`);
console.log(`Hotels: ${Array.isArray(payload.hotels) ? payload.hotels.length : 0}`);
console.log(`Errors: ${errors.length}`);
console.log(`Warnings: ${warnings.length}`);

if (errors.length) {
  console.log("\nErrors");
  errors.forEach((error) => console.log(`- ${error}`));
}

if (warnings.length) {
  console.log("\nWarnings");
  warnings.forEach((warning) => console.log(`- ${warning}`));
}

process.exit(errors.length ? 1 : 0);

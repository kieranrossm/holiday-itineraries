import fs from "node:fs";
import path from "node:path";
import { createClient } from "@sanity/client";

const sourcePath = process.argv[2] ? path.resolve(process.argv[2]) : "";

if (!sourcePath) {
  console.error("Usage: node scripts/load-hotel-search.mjs <hotel-search.json>");
  process.exit(2);
}

if (!process.env.SANITY_WRITE_TOKEN) {
  throw new Error("Missing SANITY_WRITE_TOKEN.");
}

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

const isObject = (value) => Boolean(value && typeof value === "object" && !Array.isArray(value));
const isString = (value) => typeof value === "string" && value.trim().length > 0;
const isNumber = (value) => typeof value === "number" && Number.isFinite(value);
const slugify = (value) => String(value || "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "")
  .slice(0, 96);

const normalizeGeopoint = (value) => {
  if (!isObject(value) || !isNumber(value.lat) || !isNumber(value.lng)) return value;
  return {
    _type: "geopoint",
    lat: value.lat,
    lng: value.lng,
  };
};

const normalizeSource = (source, index) => {
  if (!isObject(source)) return null;

  const normalized = {
    _key: isString(source._key) ? slugify(source._key) : `source-${index + 1}`,
    platform: source.platform || "Listing",
  };

  if (isString(source.url)) {
    normalized.url = source.url.trim();
  }

  return normalized;
};

const normalizeImage = (image) => {
  if (!isObject(image) || !isString(image.url)) return undefined;

  const normalized = { url: image.url.trim() };
  if (isString(image.alt)) normalized.alt = image.alt.trim();
  if (isString(image.source)) normalized.source = image.source.trim();

  return normalized;
};

const normalizePayload = (input) => {
  const currentSlug = isObject(input.slug) ? input.slug.current : input.slug;
  const slug = slugify(currentSlug || input.title);

  const hotels = Array.isArray(input.hotels) ? input.hotels.map((hotel, index) => ({
    ...hotel,
    _type: "hotelCandidate",
    _key: isString(hotel?._key) ? slugify(hotel._key) : slugify(hotel?.propertyName || `hotel-${index + 1}`),
    propertyType: propertyTypes.has(hotel?.propertyType) ? hotel.propertyType : "unknown",
    image: normalizeImage(hotel?.image),
    sources: Array.isArray(hotel?.sources)
      ? hotel.sources.map(normalizeSource).filter(Boolean)
      : [],
    price: hotel?.price ? {
      ...hotel.price,
      budgetStatus: budgetStatuses.has(hotel.price.budgetStatus) ? hotel.price.budgetStatus : "unknown",
    } : hotel?.price,
    coordinates: normalizeGeopoint(hotel?.coordinates),
    notes: Array.isArray(hotel?.notes) ? hotel.notes.filter(isString) : [],
  })) : [];

  return {
    ...input,
    _id: isString(input._id) ? input._id : `hotelSearch-${slug}`,
    _type: "hotelSearch",
    title: input.title || "Hotel search",
    slug: { _type: "slug", current: slug },
    status: input.status || "completed",
    search: {
      ...input.search,
      location: input.search?.location ? {
        ...input.search.location,
        geo: normalizeGeopoint(input.search.location.geo),
      } : input.search?.location,
      referencePoint: input.search?.referencePoint ? {
        ...input.search.referencePoint,
        type: referenceTypes.has(input.search.referencePoint.type) ? input.search.referencePoint.type : "other",
        geo: normalizeGeopoint(input.search.referencePoint.geo),
      } : input.search?.referencePoint,
    },
    hotels,
    metadata: {
      dataFreshness: "snapshot",
      resultStatus: "completed",
      ...(input.metadata || {}),
    },
  };
};

const validatePayload = (payload) => {
  const errors = [];
  const addError = (field, message) => errors.push(`${field}: ${message}`);
  const slug = payload.slug?.current;

  if (payload._type !== "hotelSearch") addError("_type", "must be hotelSearch");
  if (!isString(payload._id)) addError("_id", "is required");
  if (!isString(payload.title)) addError("title", "is required");
  if (!isString(slug)) addError("slug.current", "is required");
  if (!isObject(payload.search)) addError("search", "is required");
  if (!isString(payload.search?.location?.label)) addError("search.location.label", "is required");
  if (!isString(payload.search?.referencePoint?.label)) addError("search.referencePoint.label", "is required");
  if (!isString(payload.search?.dateRange?.checkIn)) addError("search.dateRange.checkIn", "is required");
  if (!isString(payload.search?.dateRange?.checkOut)) addError("search.dateRange.checkOut", "is required");
  if (!isNumber(payload.search?.budget?.targetPerNight)) addError("search.budget.targetPerNight", "must be numeric");
  if (!Array.isArray(payload.hotels)) addError("hotels", "must be an array");

  (payload.hotels || []).forEach((hotel, index) => {
    const prefix = `hotels[${index}]`;
    if (!isString(hotel._key)) addError(`${prefix}._key`, "is required");
    if (!isString(hotel.propertyName)) addError(`${prefix}.propertyName`, "is required");
    if (hotel.price?.perNight != null && !isNumber(hotel.price.perNight)) {
      addError(`${prefix}.price.perNight`, "must be numeric or null");
    }
    if (!budgetStatuses.has(hotel.price?.budgetStatus)) addError(`${prefix}.price.budgetStatus`, "is invalid");
    if (!isNumber(hotel.coordinates?.lat) || !isNumber(hotel.coordinates?.lng)) {
      addError(`${prefix}.coordinates`, "lat/lng are required for map rendering");
    }
  });

  return errors;
};

const sourcePayload = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
const payload = normalizePayload(sourcePayload);
const errors = validatePayload(payload);

if (errors.length) {
  console.error("Hotel search payload failed validation:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID || "943oi1hw",
  dataset: process.env.SANITY_DATASET || "production",
  apiVersion: process.env.SANITY_API_VERSION || "2025-02-19",
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
});

try {
  const result = await client.createOrReplace(payload);

  const readBack = await client.fetch(
    `*[_type == "hotelSearch" && _id == $id][0]{
      _id,
      title,
      "slug": slug.current,
      status,
      "hotelCount": count(hotels),
      "mappedHotelCount": count(hotels[defined(coordinates.lat) && defined(coordinates.lng)]),
      metadata {
        searchedAt,
        dataFreshness,
        resultStatus
      }
    }`,
    { id: result._id },
  );

  if (!readBack?._id) {
    throw new Error(`Hotel search write completed but read-back failed for ${result._id}.`);
  }

  console.log(JSON.stringify({
    written: readBack._id,
    title: readBack.title,
    slug: readBack.slug,
    status: readBack.status,
    sourcePath,
    hotels: readBack.hotelCount,
    mappedHotels: readBack.mappedHotelCount,
    route: `/hotel-searches/${readBack.slug}/`,
    dataFreshness: readBack.metadata?.dataFreshness,
    resultStatus: readBack.metadata?.resultStatus,
  }, null, 2));
} catch (error) {
  const code = error?.code ? ` (${error.code})` : "";
  console.error(`Sanity hotel search write failed${code}: ${error?.message || "Unknown error"}`);
  process.exit(1);
}

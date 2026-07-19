import fs from "node:fs";
import path from "node:path";
import { createClient } from "@sanity/client";
import {
  formatTransportPayloadIssues,
  validateTransportPayload,
} from "./validate-transport-payload.mjs";

const DEFAULT_SLUG = "oslo-september-2026";
const DEFAULT_SOURCE_PATH = "C:/Users/kiera/Documents/Codex/2026-06-28/nav/outputs/oslo-transport-brief-data.json";

const [slugArg, sourcePathArg] = process.argv.slice(2);
const slug = slugArg || DEFAULT_SLUG;
const sourcePath = path.resolve(sourcePathArg || DEFAULT_SOURCE_PATH);

if (!process.env.SANITY_WRITE_TOKEN) {
  throw new Error("Missing SANITY_WRITE_TOKEN.");
}

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID || "943oi1hw",
  dataset: process.env.SANITY_DATASET || "production",
  apiVersion: process.env.SANITY_API_VERSION || "2025-02-19",
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
});

const payload = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
const transportBrief = payload.transportBrief;

if (!transportBrief) {
  throw new Error("Missing transportBrief in source JSON.");
}

const validation = validateTransportPayload(payload);

if (!validation.ok) {
  throw new Error(`Transport payload validation failed before Sanity write:\n${formatTransportPayloadIssues(validation.issues)}`);
}

const trip = await client.fetch(
  `*[_type == "trip" && slug.current == $slug][0]{ _id, title }`,
  { slug },
);

if (!trip?._id) {
  throw new Error(`Could not find trip for slug "${slug}".`);
}

const result = await client
  .patch(trip._id)
  .set({ transportBrief })
  .commit({ autoGenerateArrayKeys: true });

const readBack = await client.fetch(
  `*[_type == "trip" && _id == $id][0]{
    title,
    "slug": slug.current,
    transportBrief
  }`,
  { id: result._id },
);

const readBackValidation = validateTransportPayload({ transportBrief: readBack?.transportBrief });

if (!readBackValidation.ok) {
  throw new Error(`Transport payload was written but failed read-back validation:\n${formatTransportPayloadIssues(readBackValidation.issues)}`);
}

console.log(JSON.stringify({
  patched: result._id,
  title: readBack.title,
  slug: readBack.slug,
  sourcePath,
  airportArrival: readBack.transportBrief?.airportArrival?.length || 0,
  cityTravel: readBack.transportBrief?.cityTravel?.length || 0,
  toolkit: readBack.transportBrief?.toolkit?.length || 0,
  sources: readBack.transportBrief?.sources?.length || 0,
  fullReportSections: readBack.transportBrief?.fullReport?.sections?.length || 0,
  readBackValidation: "passed",
}, null, 2));

import fs from "node:fs";
import path from "node:path";
import { createClient } from "@sanity/client";

const client = createClient({
  projectId: "943oi1hw",
  dataset: "production",
  apiVersion: "2026-06-29",
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
});

const sourcePath = path.resolve(
  "C:/Users/kiera/Documents/Codex/2026-06-28/nav/outputs/oslo-transport-brief-data.json",
);

const payload = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
const transportBrief = payload.transportBrief;

if (!transportBrief) {
  throw new Error("Missing transportBrief in source JSON.");
}

const trip = await client.fetch(
  `*[_type == "trip" && slug.current == $slug][0]{ _id, title }`,
  { slug: "oslo-september-2026" },
);

if (!trip?._id) {
  throw new Error("Could not find Oslo trip.");
}

const result = await client
  .patch(trip._id)
  .set({ transportBrief })
  .commit({ autoGenerateArrayKeys: true });

console.log(JSON.stringify({
  patched: result._id,
  title: trip.title,
  airportArrival: transportBrief.airportArrival?.length || 0,
  cityTravel: transportBrief.cityTravel?.length || 0,
  toolkit: transportBrief.toolkit?.length || 0,
}, null, 2));

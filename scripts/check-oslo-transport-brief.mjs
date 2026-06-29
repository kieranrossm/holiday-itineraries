import { createClient } from "@sanity/client";

const client = createClient({
  projectId: "943oi1hw",
  dataset: "production",
  apiVersion: "2026-06-29",
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
});

const data = await client.fetch(
  `*[_type == "trip" && slug.current == $slug][0]{
    transportBrief {
      title,
      airportArrival[] { modeLabel },
      cityTravel[] { modeLabel },
      toolkit[] { name }
    }
  }`,
  { slug: "oslo-september-2026" },
);

console.log(JSON.stringify({
  title: data.transportBrief?.title,
  airportArrival: data.transportBrief?.airportArrival?.length || 0,
  cityTravel: data.transportBrief?.cityTravel?.length || 0,
  toolkit: data.transportBrief?.toolkit?.length || 0,
}, null, 2));

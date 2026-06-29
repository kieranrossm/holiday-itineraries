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
      airportArrival[] { modeLabel, timeLabel, costLabel, servicePattern, watchOut },
      cityTravel[] { modeLabel },
      toolkit[] { name }
    }
  }`,
  { slug: "oslo-september-2026" },
);

const badMetricPattern = /\b(planning range|depending on|can surge|check exact|official taxi stand|before committing)\b/i;
const airportMetrics = data.transportBrief?.airportArrival?.map((item) => ({
  modeLabel: item.modeLabel,
  timeLabel: item.timeLabel,
  costLabel: item.costLabel,
  servicePattern: item.servicePattern,
  compact: ![item.timeLabel, item.costLabel, item.servicePattern].some((value) => badMetricPattern.test(value || "")),
})) || [];

console.log(JSON.stringify({
  title: data.transportBrief?.title,
  airportArrival: data.transportBrief?.airportArrival?.length || 0,
  cityTravel: data.transportBrief?.cityTravel?.length || 0,
  toolkit: data.transportBrief?.toolkit?.length || 0,
  airportMetrics,
}, null, 2));

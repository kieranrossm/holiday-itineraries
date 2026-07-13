// Server-side only (uses GOOGLE_MAPS_API_KEY, no PUBLIC_ prefix — must never
// reach the client). Live-fetches a Google Places photo for hotels that have
// no image from any other source. Deliberately not cached anywhere
// permanent: Google's Places API terms don't allow storing the photo
// reference long-term, so this resolves fresh at Astro build time on every
// build, the same way the rest of the site is statically generated.
//
// Requires both a confident name match AND a coordinate check before
// accepting a result — a bare text search for a chain-branded hotel name can
// return the wrong branch of the same chain (confirmed live 2026-07-13:
// searching "JI Hotel Shanghai The Bund Jiujiang Road" returned a generically
// named "JI Hotel" ~480m from the actual branch). `locationBias` narrows the
// search server-side; the post-hoc distance check is the real safety net.

const PLACES_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText";
const MAX_MATCH_DISTANCE_METERS = 350;

type GooglePlacePhoto = {
  url: string;
  attributionName: string;
  attributionUri: string;
};

const haversineMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371000;
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
};

const resolvePhotoMediaUrl = async (photoName: string, apiKey: string, maxWidthPx = 800): Promise<string | null> => {
  const url = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${maxWidthPx}&key=${apiKey}&skipHttpRedirect=true`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as { photoUri?: string };
    return data.photoUri || null;
  } catch {
    return null;
  }
};

export const findHotelPhoto = async (
  hotelName: string,
  lat: number,
  lon: number,
  apiKey: string,
): Promise<GooglePlacePhoto | null> => {
  if (!apiKey || !hotelName || !Number.isFinite(lat) || !Number.isFinite(lon)) return null;

  let searchResult: { places?: Array<{ location?: { latitude: number; longitude: number }; photos?: Array<{ name: string; authorAttributions?: Array<{ displayName: string; uri: string }> }> }> };
  try {
    const res = await fetch(PLACES_SEARCH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.location,places.photos",
      },
      body: JSON.stringify({
        textQuery: hotelName,
        locationBias: {
          circle: { center: { latitude: lat, longitude: lon }, radius: 500 },
        },
      }),
    });
    if (!res.ok) return null;
    searchResult = await res.json();
  } catch {
    return null;
  }

  const place = (searchResult.places || [])[0];
  if (!place || !place.location || !place.photos?.length) return null;

  const distance = haversineMeters(lat, lon, place.location.latitude, place.location.longitude);
  if (distance > MAX_MATCH_DISTANCE_METERS) return null;

  const photo = place.photos[0];
  const mediaUrl = await resolvePhotoMediaUrl(photo.name, apiKey);
  if (!mediaUrl) return null;

  const attribution = photo.authorAttributions?.[0];
  return {
    url: mediaUrl,
    attributionName: attribution?.displayName || "Google Maps contributor",
    attributionUri: attribution?.uri || "",
  };
};

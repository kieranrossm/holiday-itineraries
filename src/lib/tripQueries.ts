export const visibleTripSlugsQuery = `*[_type == "trip" && (!defined(displayStatus) || displayStatus == "visible")] { "slug": slug.current }`;

export const weatherForecastQuery = `
  enabled,
  locationLabel,
  latitude,
  longitude
`;

export const weatherIconSetQuery = `
  iconSetRef->{
    "sunnyUrl": sunny.asset->url,
    "partlyCloudyUrl": partlyCloudy.asset->url,
    "cloudyUrl": cloudy.asset->url,
    "fogUrl": fog.asset->url,
    "drizzleUrl": drizzle.asset->url,
    "rainUrl": rain.asset->url,
    "heavyRainUrl": heavyRain.asset->url,
    "snowUrl": snow.asset->url,
    "thunderstormUrl": thunderstorm.asset->url
  },
  iconSet {
    "sunnyUrl": sunny.asset->url,
    "partlyCloudyUrl": partlyCloudy.asset->url,
    "cloudyUrl": cloudy.asset->url,
    "fogUrl": fog.asset->url,
    "drizzleUrl": drizzle.asset->url,
    "rainUrl": rain.asset->url,
    "heavyRainUrl": heavyRain.asset->url,
    "snowUrl": snow.asset->url,
    "thunderstormUrl": thunderstorm.asset->url
  }
`;

export const tripDetailQuery = `*[_type == "trip" && slug.current == $slug][0] {
  title,
  startDate,
  heroIntro,
  "heroImageUrl": heroImage.asset->url,
  weatherConfig {
    ${weatherForecastQuery},
    ${weatherIconSetQuery}
  },
  sections[] {
    sectionTitle,
    sectionIntro,
    "sectionImageUrl": sectionImage.asset->url,
    layoutStyle,
    initialLoadState,
    weatherConfig {
      ${weatherForecastQuery}
    },
    foodShortlist[] {
      name,
      "imageUrl": image.asset->url,
      foodType,
      area,
      shortNote,
      decisionStatus,
      openingHours {
        monday,
        tuesday,
        wednesday,
        thursday,
        friday,
        saturday,
        sunday
      },
      priceVibe,
      bookingStatus,
      websiteUrl,
      mapUrl,
      coordinates,
      showOnDashboardMap
    },
    places[] {
      placeName,
      schedule {
        date,
        startTime,
        endTime,
        duration,
        suggestedTime,
        timingStatus,
        timingNote
      },
      category,
      area,
      shortDescription,
      decisionStatus,
      info,
      practicalInfo,
      costStructure,
      bookingLogistics,
      paymentStatus,
      bookingUrl,
      websiteUrl,
      travelNote,
      "photoUrl": photo.asset->url,
      coordinates,
      countAsStop,
      showOnDashboardMap,
      transitDetails,
      hotelDetails
    }
  }
}`;

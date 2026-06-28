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
  transportHub {
    enabled,
    generatedAt,
    destinationLabel,
    stayAreaLabel,
    travellerSummary,
    bestMoveFirst,
    arrivalAccess[] {
      routeName,
      from,
      to,
      bestFor,
      duration,
      cost,
      typicalFrequency,
      firstService,
      lastService,
      nightServiceStatus,
      lateArrivalFallback,
      confidence,
      warning,
      sourceNote,
      plannerUrl
    },
    networkOverview[] {
      mode,
      useFor,
      notes
    },
    ticketsAndApps[] {
      title,
      recommendation,
      details,
      url
    },
    passes[] {
      name,
      verdict,
      breakEven,
      notes,
      url
    },
    usefulCostMarkers[] {
      label,
      cost,
      notes
    },
    serviceTimes[] {
      routeName,
      typicalFrequency,
      firstService,
      lastService,
      nightServiceStatus,
      lateArrivalFallback,
      confidence,
      warning
    },
    decisionMatrix[] {
      situation,
      useThis,
      why
    },
    caveats,
    qualityFlags,
    rawStructuredOutputJson
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

export const visibleTripSlugsQuery = `*[_type == "trip" && (!defined(displayStatus) || displayStatus == "visible")] { "slug": slug.current }`;

export const visibleHotelSearchSlugsQuery = `*[_type == "hotelSearch" && (!defined(status) || status != "archived")] { "slug": slug.current }`;

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
  transportBrief {
    title,
    defaultRecommendation,
    generatedAt,
    destinationLabel,
    stayAreaLabel,
    airportArrival[] {
      id,
      modeLabel,
      roleLabel,
      routeLabel,
      timeLabel,
      costLabel,
      servicePattern,
      coverage,
      coverageQualifier,
      watchOut,
      serviceWindow {
        firstService,
        lastService,
        typicalFrequency,
        nightServiceStatus,
        confidence,
        frequencyBasis,
        firstServiceVerified,
        lastServiceVerified,
        lateArrivalFallback
      },
      showRoute,
      routeDetails {
        steps,
        ticketNote,
        lateArrivalNote,
        onwardConnectionNote,
        costNote
      },
      evidenceIds,
      sourceIds
    },
    cityTravel[] {
      id,
      modeLabel,
      useFor,
      pattern,
      coverage,
      coverageQualifier,
      passQualifier,
      ticketQualifier,
      seasonality,
      lateNightNote,
      bestFor,
      watchOut,
      evidenceIds,
      sourceIds
    },
    toolkit[] {
      id,
      name,
      category,
      useFor,
      actionLabel,
      url,
      faviconUrl,
      iconUrl,
      note,
      evidenceIds
    },
    paymentReadiness {
      summary,
      cardOrContactlessRequired,
      appPaymentSupported,
      cashCaveat,
      evidenceIds
    },
    fullReportPointer,
    fullReport {
      summary,
      sections[] {
        title,
        body,
        evidenceIds
      }
    },
    sources[] {
      id,
      label,
      url,
      checked
    }
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

export const hotelSearchDetailQuery = `*[_type == "hotelSearch" && slug.current == $slug][0] {
  title,
  "slug": slug.current,
  status,
  search {
    location {
      label,
      country,
      geo
    },
    referencePoint {
      type,
      label,
      geo
    },
    dateRange {
      checkIn,
      checkOut,
      nights
    },
    guests {
      adults,
      children,
      rooms
    },
    budget {
      currency,
      targetPerNight,
      flexPerNight
    }
  },
  summary {
    headline,
    bestOverallHotelName,
    notes
  },
  hotels[] {
    rank,
    propertyName,
    propertyType,
    area,
    image {
      url,
      alt,
      source
    },
    sources[] {
      platform,
      url
    },
    review {
      scorePercent,
      reviewCount,
      source
    },
    price {
      perNight,
      currency,
      budgetStatus,
      overTargetAmount,
      overFlexAmount,
      checkedAt
    },
    distance {
      fromReferenceLabel,
      walkingMinutes,
      walkingMeters,
      source,
      checkedAt
    },
    amenities {
      airConditioning,
      pool,
      fridge
    },
    coordinates,
    notes,
    booked,
    flags
  },
  exclusions[] {
    propertyName,
    reason
  },
  bookingOutcome {
    bookedPropertyName,
    bookedAt,
    matchedTopPick,
    whyNote,
    actualPricePerNight
  },
  stayReview {
    reviewedAt,
    matchedExpectations,
    whatWorked,
    whatDidnt,
    wouldReturn
  },
  availabilityPreview {
    note,
    dateRange {
      checkIn,
      checkOut,
      nights
    },
    hotels[] {
      propertyName,
      source {
        platform,
        url
      },
      price {
        perNight,
        currency
      },
      review {
        scorePercent,
        reviewCount
      },
      distance {
        walkingMinutes,
        fromReferenceLabel
      },
      coordinates
    }
  },
  metadata {
    searchedAt,
    dataFreshness,
    resultStatus
  }
}`;

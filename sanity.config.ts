import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';

type ValidationRule = {
  required: () => ValidationRule;
  min: (value: number) => ValidationRule;
  max: (value: number) => ValidationRule;
};

type HiddenContext = {
  parent?: Record<string, any>;
};

type FoodPreviewSelection = {
  title?: string;
  foodType?: string;
  area?: string;
};

type SectionPreviewSelection = {
  title?: string;
  layoutStyle?: string;
  initialLoadState?: string;
};

type WeatherIconSetPreviewSelection = {
  title?: string;
};

type HotelSearchPreviewSelection = {
  title?: string;
  locationLabel?: string;
  status?: string;
};

type HotelCandidatePreviewSelection = {
  title?: string;
  propertyType?: string;
  pricePerNight?: number;
};

const decisionStateOptions = [
  { title: 'Must do', value: 'must-do' },
  { title: 'Maybe', value: 'maybe' },
  { title: 'Backup', value: 'backup' },
  { title: 'Weather dependent', value: 'weather-dependent' },
  { title: 'Avoid if tired', value: 'avoid-if-tired' },
];

const openingHoursFields = [
  { name: 'monday', title: 'Monday', type: 'string' },
  { name: 'tuesday', title: 'Tuesday', type: 'string' },
  { name: 'wednesday', title: 'Wednesday', type: 'string' },
  { name: 'thursday', title: 'Thursday', type: 'string' },
  { name: 'friday', title: 'Friday', type: 'string' },
  { name: 'saturday', title: 'Saturday', type: 'string' },
  { name: 'sunday', title: 'Sunday', type: 'string' },
];

const transportCoverageLabelOptions = [
  { title: 'Oslo Pass-covered', value: 'Oslo Pass-covered' },
  { title: 'Not Oslo Pass-covered', value: 'Not Oslo Pass-covered' },
  { title: 'Ruter ticket', value: 'Ruter ticket' },
  { title: 'Vy/Ruter ticket', value: 'Vy/Ruter ticket' },
  { title: 'Flytoget ticket', value: 'Flytoget ticket' },
  { title: 'Card/app payment', value: 'Card/app payment' },
];

const transportPaymentRequiredOptions = [
  { title: 'Yes', value: 'yes' },
  { title: 'No', value: 'no' },
  { title: 'Unknown / check locally', value: 'unknown' },
];

const weatherIconSetFields = [
  {
    name: 'sunny',
    title: 'Sunny Icon',
    type: 'image',
    description: 'Used for clear sunny forecast conditions.',
    options: { hotspot: true },
  },
  {
    name: 'partlyCloudy',
    title: 'Partly Cloudy / Partly Sunny Icon',
    type: 'image',
    description: 'Used for mainly clear, partly cloudy, or partly sunny forecast conditions.',
    options: { hotspot: true },
  },
  {
    name: 'cloudy',
    title: 'Cloudy Icon',
    type: 'image',
    description: 'Used for overcast forecast conditions.',
    options: { hotspot: true },
  },
  {
    name: 'fog',
    title: 'Fog Icon',
    type: 'image',
    description: 'Used for foggy forecast conditions.',
    options: { hotspot: true },
  },
  {
    name: 'drizzle',
    title: 'Drizzle Icon',
    type: 'image',
    description: 'Used for drizzle or light showery forecast conditions.',
    options: { hotspot: true },
  },
  {
    name: 'rain',
    title: 'Rain Icon',
    type: 'image',
    description: 'Used for rain or showers.',
    options: { hotspot: true },
  },
  {
    name: 'heavyRain',
    title: 'Heavy Rain Icon',
    type: 'image',
    description: 'Used for heavier rain or heavier shower forecast conditions.',
    options: { hotspot: true },
  },
  {
    name: 'snow',
    title: 'Snow Icon',
    type: 'image',
    description: 'Used for snow forecast conditions.',
    options: { hotspot: true },
  },
  {
    name: 'thunderstorm',
    title: 'Thunderstorm Icon',
    type: 'image',
    description: 'Used for thunderstorm forecast conditions.',
    options: { hotspot: true },
  },
];

const weatherConfigField = {
  name: 'weatherConfig',
  title: 'Weather Forecast Configuration',
  type: 'object',
  description:
    'Optional. When enabled and latitude/longitude are populated, the public page will show a live 7-day forecast starting from today. Weather icons are configured once at trip level.',
  fields: [
    {
      name: 'enabled',
      title: 'Show Weather Forecast',
      type: 'boolean',
      description: 'Turn this on to display a 7-day weather forecast for this trip or section.',
      initialValue: false,
    },
    {
      name: 'locationLabel',
      title: 'Weather Location Label',
      type: 'string',
      description: 'Label shown above the weather bar, for example "Tenerife", "Beijing", or "Xi’an".',
      hidden: ({ parent }: HiddenContext) => !parent?.enabled,
    },
    {
      name: 'latitude',
      title: 'Latitude',
      type: 'number',
      description: 'Latitude used by the weather provider.',
      hidden: ({ parent }: HiddenContext) => !parent?.enabled,
      validation: (Rule: ValidationRule) => Rule.min(-90).max(90),
    },
    {
      name: 'longitude',
      title: 'Longitude',
      type: 'number',
      description: 'Longitude used by the weather provider.',
      hidden: ({ parent }: HiddenContext) => !parent?.enabled,
      validation: (Rule: ValidationRule) => Rule.min(-180).max(180),
    },
    {
      name: 'iconSetRef',
      title: 'Shared Weather Icons',
      type: 'reference',
      description:
        'One reusable icon set used by every weather forecast on this trip, including section and city forecasts.',
      hidden: ({ parent }: HiddenContext) => !parent?.enabled,
      to: [{ type: 'weatherIconSet' }],
    },
    {
      name: 'iconSet',
      title: 'Legacy Embedded Weather Icons',
      type: 'object',
      description:
        'Optional fallback kept for existing trips. New weather forecasts should use Shared Weather Icons above.',
      hidden: ({ parent }: HiddenContext) => !parent?.enabled,
      fields: weatherIconSetFields,
    },
  ],
};

const sectionWeatherConfigField = {
  name: 'weatherConfig',
  title: 'Weather Forecast Configuration',
  type: 'object',
  description:
    'Optional section-specific weather location. Icons are inherited from the trip-level weather configuration.',
  fields: [
    {
      name: 'enabled',
      title: 'Show Weather Forecast',
      type: 'boolean',
      description: 'Turn this on to display a 7-day weather forecast for this section.',
      initialValue: false,
    },
    {
      name: 'locationLabel',
      title: 'Weather Location Label',
      type: 'string',
      description: 'Label shown above the weather bar, for example "Beijing", "Xi\'an", or "Shanghai".',
      hidden: ({ parent }: HiddenContext) => !parent?.enabled,
    },
    {
      name: 'latitude',
      title: 'Latitude',
      type: 'number',
      description: 'Latitude used by the weather provider.',
      hidden: ({ parent }: HiddenContext) => !parent?.enabled,
      validation: (Rule: ValidationRule) => Rule.min(-90).max(90),
    },
    {
      name: 'longitude',
      title: 'Longitude',
      type: 'number',
      description: 'Longitude used by the weather provider.',
      hidden: ({ parent }: HiddenContext) => !parent?.enabled,
      validation: (Rule: ValidationRule) => Rule.min(-180).max(180),
    },
  ],
};

const weatherIconSetSchema = {
  name: 'weatherIconSet',
  type: 'document',
  title: 'Weather Icon Set',
  fields: [
    {
      name: 'title',
      title: 'Icon Set Name',
      type: 'string',
      description: 'Example: Default travel weather icons.',
      validation: (Rule: ValidationRule) => Rule.required(),
    },
    ...weatherIconSetFields,
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare({ title }: WeatherIconSetPreviewSelection) {
      return {
        title,
        subtitle: 'Reusable weather icons',
      };
    },
  },
};

const hotelPropertyTypeOptions = [
  { title: 'Hotel', value: 'hotel' },
  { title: 'Aparthotel', value: 'aparthotel' },
  { title: 'Self-catering', value: 'self_catering' },
  { title: 'Apartment', value: 'apartment' },
  { title: 'Villa', value: 'villa' },
  { title: 'Guesthouse', value: 'guesthouse' },
  { title: 'Resort', value: 'resort' },
  { title: 'Hostel', value: 'hostel' },
  { title: 'Unknown / not checked', value: 'unknown' },
];

const hotelBudgetStatusOptions = [
  { title: 'Within target', value: 'within' },
  { title: 'Within flex range', value: 'flex' },
  { title: 'Over flex range', value: 'over' },
  { title: 'Unknown / not checked', value: 'unknown' },
];

const hotelSourceFields = [
  { name: 'platform', title: 'Platform', type: 'string' },
  { name: 'url', title: 'URL', type: 'url' },
];

const hotelCandidateField = {
  name: 'hotelCandidate',
  title: 'Hotel Candidate',
  type: 'object',
  fields: [
    { name: 'rank', title: 'Rank', type: 'number' },
    {
      name: 'propertyName',
      title: 'Property Name',
      type: 'string',
      validation: (Rule: ValidationRule) => Rule.required(),
    },
    {
      name: 'propertyType',
      title: 'Property Type',
      type: 'string',
      options: {
        list: hotelPropertyTypeOptions,
        layout: 'dropdown',
      },
      initialValue: 'unknown',
    },
    { name: 'area', title: 'Area / Neighbourhood', type: 'string' },
    {
      name: 'sources',
      title: 'Sources',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: hotelSourceFields,
        },
      ],
    },
    {
      name: 'review',
      title: 'Review Signal',
      type: 'object',
      fields: [
        { name: 'scorePercent', title: 'Score Percent', type: 'number' },
        { name: 'reviewCount', title: 'Review Count', type: 'number' },
        { name: 'source', title: 'Review Source', type: 'string' },
      ],
    },
    {
      name: 'price',
      title: 'Price Snapshot',
      type: 'object',
      fields: [
        { name: 'perNight', title: 'Cost Per Night', type: 'number' },
        { name: 'currency', title: 'Currency', type: 'string', initialValue: 'GBP' },
        {
          name: 'budgetStatus',
          title: 'Budget Status',
          type: 'string',
          options: {
            list: hotelBudgetStatusOptions,
            layout: 'dropdown',
          },
          initialValue: 'unknown',
        },
        { name: 'overTargetAmount', title: 'Amount Over Target', type: 'number' },
        { name: 'overFlexAmount', title: 'Amount Over Flex Limit', type: 'number' },
        { name: 'checkedAt', title: 'Price Checked At', type: 'datetime' },
      ],
    },
    {
      name: 'distance',
      title: 'Distance From Reference',
      type: 'object',
      fields: [
        { name: 'fromReferenceLabel', title: 'Reference Label', type: 'string' },
        { name: 'walkingMinutes', title: 'Walking Time (Minutes)', type: 'number' },
        { name: 'walkingMeters', title: 'Walking Distance (Metres)', type: 'number' },
        { name: 'source', title: 'Distance Source', type: 'string', initialValue: 'google_directions_api' },
        { name: 'checkedAt', title: 'Distance Checked At', type: 'datetime' },
      ],
    },
    {
      name: 'amenities',
      title: 'Amenities',
      type: 'object',
      fields: [
        { name: 'airConditioning', title: 'Air conditioning confirmed', type: 'boolean' },
        { name: 'pool', title: 'Pool confirmed', type: 'boolean' },
      ],
    },
    { name: 'coordinates', title: 'Map Coordinates', type: 'geopoint' },
    { name: 'notes', title: 'Notes', type: 'array', of: [{ type: 'string' }] },
  ],
  preview: {
    select: {
      title: 'propertyName',
      propertyType: 'propertyType',
      pricePerNight: 'price.perNight',
    },
    prepare({ title, propertyType, pricePerNight }: HotelCandidatePreviewSelection) {
      return {
        title,
        subtitle: [
          propertyType,
          typeof pricePerNight === 'number' ? `GBP ${pricePerNight}/night` : '',
        ].filter(Boolean).join(' - ') || 'Hotel candidate',
      };
    },
  },
};

const hotelSearchSchema = {
  name: 'hotelSearch',
  type: 'document',
  title: 'Hotel Search',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule: ValidationRule) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule: ValidationRule) => Rule.required(),
    },
    {
      name: 'status',
      title: 'Search Status',
      type: 'string',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'Completed', value: 'completed' },
          { title: 'Archived', value: 'archived' },
        ],
        layout: 'dropdown',
      },
      initialValue: 'completed',
    },
    {
      name: 'search',
      title: 'Search Context',
      type: 'object',
      fields: [
        {
          name: 'location',
          title: 'Location',
          type: 'object',
          fields: [
            { name: 'label', title: 'Location Label', type: 'string' },
            { name: 'country', title: 'Country', type: 'string' },
            { name: 'geo', title: 'Location Centre', type: 'geopoint' },
          ],
        },
        {
          name: 'referencePoint',
          title: 'Reference Point',
          type: 'object',
          fields: [
            {
              name: 'type',
              title: 'Reference Type',
              type: 'string',
              options: {
                list: [
                  { title: 'Landmark', value: 'landmark' },
                  { title: 'Location centre', value: 'location_center' },
                  { title: 'Attraction', value: 'attraction' },
                  { title: 'Beach', value: 'beach' },
                  { title: 'Station', value: 'station' },
                  { title: 'Other', value: 'other' },
                ],
                layout: 'dropdown',
              },
            },
            { name: 'label', title: 'Reference Label', type: 'string' },
            { name: 'geo', title: 'Reference Coordinates', type: 'geopoint' },
          ],
        },
        {
          name: 'dateRange',
          title: 'Date Range',
          type: 'object',
          fields: [
            { name: 'checkIn', title: 'Check-in', type: 'date' },
            { name: 'checkOut', title: 'Check-out', type: 'date' },
            { name: 'nights', title: 'Nights', type: 'number' },
          ],
        },
        {
          name: 'guests',
          title: 'Guests',
          type: 'object',
          fields: [
            { name: 'adults', title: 'Adults', type: 'number' },
            { name: 'children', title: 'Children', type: 'number' },
            { name: 'rooms', title: 'Rooms', type: 'number' },
          ],
        },
        {
          name: 'budget',
          title: 'Budget',
          type: 'object',
          fields: [
            { name: 'currency', title: 'Currency', type: 'string', initialValue: 'GBP' },
            { name: 'targetPerNight', title: 'Target Per Night', type: 'number' },
            { name: 'flexPerNight', title: 'Flex Per Night', type: 'number' },
          ],
        },
      ],
    },
    {
      name: 'summary',
      title: 'Summary',
      type: 'object',
      fields: [
        { name: 'headline', title: 'Headline', type: 'text', rows: 2 },
        { name: 'bestOverallHotelName', title: 'Best Overall Hotel Name', type: 'string' },
        { name: 'notes', title: 'Notes', type: 'array', of: [{ type: 'string' }] },
      ],
    },
    {
      name: 'hotels',
      title: 'Hotel Options',
      type: 'array',
      of: [hotelCandidateField],
    },
    {
      name: 'metadata',
      title: 'Metadata',
      type: 'object',
      fields: [
        { name: 'searchedAt', title: 'Searched At', type: 'datetime' },
        { name: 'dataFreshness', title: 'Data Freshness', type: 'string', initialValue: 'snapshot' },
        { name: 'resultStatus', title: 'Result Status', type: 'string', initialValue: 'completed' },
      ],
    },
  ],
  preview: {
    select: {
      title: 'title',
      locationLabel: 'search.location.label',
      status: 'status',
    },
    prepare({ title, locationLabel, status }: HotelSearchPreviewSelection) {
      return {
        title,
        subtitle: [locationLabel, status].filter(Boolean).join(' - ') || 'Hotel search',
      };
    },
  },
};

const foodShortlistField = {
  name: 'foodShortlist',
  title: 'Food & Drink Shortlist',
  type: 'array',
  description:
    'Compact restaurant, cafe, bar, and snack options for this section. These render as smaller cards than full itinerary stops.',
  of: [
    {
      name: 'foodOption',
      title: 'Food / Drink Option',
      type: 'object',
      fields: [
        {
          name: 'name',
          title: 'Name',
          type: 'string',
          validation: (Rule: ValidationRule) => Rule.required(),
        },
        {
          name: 'image',
          title: 'Restaurant Image',
          type: 'image',
          description: 'Optional compact listing image shown on the public food shortlist card.',
          options: { hotspot: true },
        },
        {
          name: 'foodType',
          title: 'Food Type / Cuisine',
          type: 'string',
          description: 'Example: Beijing duck, noodles, coffee, cocktail bar.',
        },
        {
          name: 'area',
          title: 'Area / Neighbourhood',
          type: 'string',
        },
        {
          name: 'shortNote',
          title: 'Short Note',
          type: 'text',
          rows: 2,
        },
        {
          name: 'decisionStatus',
          title: 'Decision State',
          type: 'string',
          description: 'Optional planning label for itinerary scanning.',
          options: {
            list: decisionStateOptions,
            layout: 'dropdown',
          },
        },
        {
          name: 'openingHours',
          title: 'Opening Hours',
          type: 'object',
          description: 'Optional compact Monday to Sunday restaurant opening hours. Use Closed for closed days.',
          fields: openingHoursFields,
        },
        {
          name: 'priceVibe',
          title: 'Price Vibe',
          type: 'string',
          options: {
            list: [
              { title: 'Budget', value: 'budget' },
              { title: 'Mid-range', value: 'mid-range' },
              { title: 'Splurge', value: 'splurge' },
              { title: 'Unknown / not checked', value: 'unknown' },
            ],
            layout: 'dropdown',
          },
          initialValue: 'unknown',
        },
        {
          name: 'bookingStatus',
          title: 'Booking Status',
          type: 'string',
          options: {
            list: [
              { title: 'No booking needed', value: 'not-needed' },
              { title: 'Consider booking', value: 'consider-booking' },
              { title: 'Booked', value: 'booked' },
            ],
            layout: 'dropdown',
          },
          initialValue: 'not-needed',
        },
        {
          name: 'websiteUrl',
          title: 'Website URL',
          type: 'url',
        },
        {
          name: 'mapUrl',
          title: 'Map Link',
          type: 'url',
          description: 'Google Maps, Apple Maps, Baidu, Trip.com, or another useful map/listing URL.',
        },
        {
          name: 'coordinates',
          title: 'Map Geopoint Coordinates',
          type: 'geopoint',
        },
        {
          name: 'showOnDashboardMap',
          title: 'Show on Trip Dashboard Map',
          type: 'boolean',
          description: 'Turn off for food options that should stay on the section map only.',
          initialValue: true,
        },
      ],
      preview: {
        select: {
          title: 'name',
          foodType: 'foodType',
          area: 'area',
        },
        prepare({ title, foodType, area }: FoodPreviewSelection) {
          return {
            title,
            subtitle: [foodType, area].filter(Boolean).join(' - ') || 'Food / drink option',
          };
        },
      },
    },
  ],
};

const transitDetailsField = {
  name: 'transitDetails',
  title: 'Journey Details',
  type: 'object',
  hidden: ({ parent }: HiddenContext) => parent?.category !== 'Transit',
  fields: [
    { name: 'origin', type: 'string', title: 'Origin Station/Airport' },
    { name: 'destination', type: 'string', title: 'Destination Station/Airport' },
    { name: 'carrier', type: 'string', title: 'Carrier / Line Name' },
    { name: 'reference', type: 'string', title: 'Booking Reference' },
    { name: 'seatAssignment', type: 'string', title: 'Seat / Class Assignment' },
    { name: 'bookingDetailsText', type: 'string', title: 'Booking Details (Additional Notes String)' },
    {
      name: 'airportParkingLogistics',
      title: 'Airport Parking Logistics',
      type: 'object',
      fields: [
        {
          name: 'status',
          title: 'Parking Status',
          type: 'string',
          options: {
            list: [
              { title: '⚪ Not Needed', value: 'not-needed' },
              { title: '⏳ Required / To Book', value: 'required' },
              { title: '✅ Booked', value: 'booked' },
            ],
          },
          initialValue: 'not-needed',
        },
        {
          name: 'locationInfo',
          title: 'Car Park Location / Terminal Area',
          type: 'string',
          hidden: ({ parent }: HiddenContext) => parent?.status === 'not-needed',
        },
      ],
    },
  ],
};

const transportBriefField = {
  name: 'transportBrief',
  title: 'Transport Brief',
  type: 'object',
  description: 'Canonical trip-level transport object generated by the Local Transport Intelligence skill.',
  options: {
    collapsible: true,
    collapsed: false,
  },
  fields: [
    { name: 'title', title: 'Title', type: 'string' },
    { name: 'defaultRecommendation', title: 'Default Recommendation', type: 'text', rows: 3 },
    { name: 'generatedAt', title: 'Generated / Checked At', type: 'date' },
    { name: 'destinationLabel', title: 'Destination Label', type: 'string' },
    { name: 'stayAreaLabel', title: 'Stay Area Label', type: 'string' },
    {
      name: 'airportArrival',
      title: 'Airport Arrival Cards',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'id', title: 'ID', type: 'string' },
            { name: 'modeLabel', title: 'Mode Label', type: 'string' },
            { name: 'roleLabel', title: 'Role Label', type: 'string' },
            { name: 'routeLabel', title: 'Route Label', type: 'string' },
            { name: 'timeLabel', title: 'Time Label', type: 'string', description: 'Compact comparison value only, e.g. 40-55 min.' },
            { name: 'costLabel', title: 'Cost Label', type: 'string', description: 'Compact fare/range only, e.g. 900-1400 NOK / ~GBP 66-102. Put caveats in Watch Out or Route Details.' },
            { name: 'servicePattern', title: 'Service Pattern', type: 'string', description: 'Compact service marker only, e.g. Regular departures, Every 10-20 min, or On demand.' },
            { name: 'coverage', title: 'Coverage Badges', type: 'array', of: [{ type: 'string' }], description: 'Use canonical compact labels only. Put zone/operator detail in Coverage Qualifier.', options: { list: transportCoverageLabelOptions } },
            { name: 'coverageQualifier', title: 'Coverage Qualifier', type: 'string', description: 'Visible compact detail shown under the badge row, e.g. zones 1, 2, 3, 4V, 4N or local Vy airport trains only. Do not rely on hover-only title text for important coverage detail.' },
            { name: 'watchOut', title: 'Watch Out', type: 'text', rows: 2 },
            {
              name: 'serviceWindow',
              title: 'Service Window',
              type: 'object',
              description: 'Structured late-arrival service data. Use Check Timetable when exact first/last service is not verified.',
              fields: [
                { name: 'firstService', title: 'First Service', type: 'string' },
                { name: 'lastService', title: 'Last Service', type: 'string' },
                { name: 'typicalFrequency', title: 'Typical Frequency', type: 'string' },
                { name: 'nightServiceStatus', title: 'Night Service Status', type: 'string' },
                { name: 'confidence', title: 'Confidence', type: 'string', description: 'high, medium, or low.' },
                { name: 'frequencyBasis', title: 'Frequency Basis', type: 'text', rows: 2 },
                { name: 'firstServiceVerified', title: 'First Service Verified', type: 'boolean' },
                { name: 'lastServiceVerified', title: 'Last Service Verified', type: 'boolean' },
                { name: 'lateArrivalFallback', title: 'Late Arrival Fallback', type: 'text', rows: 2 },
              ],
            },
            { name: 'showRoute', title: 'Show Route Drill-down', type: 'boolean', initialValue: true },
            {
              name: 'routeDetails',
              title: 'Route Details',
              type: 'object',
              fields: [
                { name: 'steps', title: 'Steps', type: 'array', of: [{ type: 'string' }] },
                { name: 'ticketNote', title: 'Ticket Note', type: 'text', rows: 2 },
                { name: 'lateArrivalNote', title: 'Late Arrival Note', type: 'text', rows: 2 },
                { name: 'onwardConnectionNote', title: 'Onward Connection Note', type: 'text', rows: 2 },
                { name: 'costNote', title: 'Cost Note', type: 'text', rows: 2 },
              ],
            },
            { name: 'evidenceIds', title: 'Evidence IDs', type: 'array', of: [{ type: 'string' }] },
          ],
          preview: {
            select: {
              title: 'modeLabel',
              subtitle: 'roleLabel',
            },
          },
        },
      ],
    },
    {
      name: 'cityTravel',
      title: 'City Travel Cards',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'id', title: 'ID', type: 'string' },
            { name: 'modeLabel', title: 'Mode Label', type: 'string' },
            { name: 'useFor', title: 'Use For', type: 'string' },
            { name: 'pattern', title: 'Pattern', type: 'text', rows: 2 },
            { name: 'coverage', title: 'Coverage Badges', type: 'array', of: [{ type: 'string' }], description: 'Use canonical compact labels only. Put zone/operator detail in Coverage Qualifier.', options: { list: transportCoverageLabelOptions } },
            { name: 'coverageQualifier', title: 'Coverage Qualifier', type: 'string', description: 'Visible compact detail shown under the badge row, e.g. zones 1, 2, 3, 4V, 4N. Do not rely on hover-only title text for important coverage detail.' },
            { name: 'passQualifier', title: 'Pass Qualifier', type: 'string', description: 'Visible pass detail such as zones, exclusions, or local train only.' },
            { name: 'ticketQualifier', title: 'Ticket Qualifier', type: 'string', description: 'Visible ticket/operator detail such as which local ticket, app, or operator to use.' },
            { name: 'seasonality', title: 'Seasonality', type: 'string', description: 'Short seasonality note, especially for ferries, mountain routes, beaches, or island services.' },
            { name: 'lateNightNote', title: 'Late-night Note', type: 'string', description: 'Short late-service warning or planner-check note.' },
            { name: 'bestFor', title: 'Best For', type: 'string', description: 'Short traveller decision cue.' },
            { name: 'watchOut', title: 'Watch Out', type: 'text', rows: 2 },
            { name: 'evidenceIds', title: 'Evidence IDs', type: 'array', of: [{ type: 'string' }] },
            { name: 'sourceIds', title: 'Source IDs', type: 'array', of: [{ type: 'string' }], description: 'Optional alias for evidence IDs when importing from source-oriented payloads.' },
          ],
          preview: {
            select: {
              title: 'modeLabel',
              subtitle: 'useFor',
            },
          },
        },
      ],
    },
    {
      name: 'toolkit',
      title: 'Apps & Links Toolkit',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'id', title: 'ID', type: 'string' },
            { name: 'name', title: 'Name', type: 'string' },
            { name: 'category', title: 'Category', type: 'string' },
            { name: 'useFor', title: 'Use For', type: 'string' },
            { name: 'actionLabel', title: 'Action Label', type: 'string' },
            { name: 'url', title: 'URL', type: 'url' },
            { name: 'faviconUrl', title: 'Favicon URL', type: 'url', description: 'Optional harvested icon for this app or link. The frontend can fall back to the URL domain favicon.' },
            { name: 'iconUrl', title: 'Icon URL', type: 'url', description: 'Optional explicit icon URL if it is not a normal favicon.' },
            { name: 'note', title: 'Note', type: 'text', rows: 2 },
            { name: 'evidenceIds', title: 'Evidence IDs', type: 'array', of: [{ type: 'string' }] },
            { name: 'sourceIds', title: 'Source IDs', type: 'array', of: [{ type: 'string' }], description: 'Optional alias for evidence IDs when importing from source-oriented payloads.' },
          ],
          preview: {
            select: {
              title: 'name',
              subtitle: 'category',
            },
          },
        },
      ],
    },
    {
      name: 'paymentReadiness',
      title: 'Payment Readiness',
      type: 'object',
      fields: [
        { name: 'summary', title: 'Summary', type: 'text', rows: 2 },
        { name: 'cardOrContactlessRequired', title: 'Card / Contactless Required', type: 'string', options: { list: transportPaymentRequiredOptions, layout: 'dropdown' }, initialValue: 'unknown' },
        { name: 'appPaymentSupported', title: 'App Payment Supported', type: 'boolean' },
        { name: 'cashCaveat', title: 'Cash Caveat', type: 'text', rows: 2 },
        { name: 'evidenceIds', title: 'Evidence IDs', type: 'array', of: [{ type: 'string' }] },
      ],
    },
    { name: 'fullReportPointer', title: 'Full Report Pointer', type: 'string' },
    {
      name: 'fullReport',
      title: 'Full Report',
      type: 'object',
      fields: [
        { name: 'summary', title: 'Summary', type: 'text', rows: 3 },
        {
          name: 'sections',
          title: 'Sections',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                { name: 'title', title: 'Title', type: 'string' },
                { name: 'body', title: 'Body', type: 'text', rows: 4 },
                { name: 'evidenceIds', title: 'Evidence IDs', type: 'array', of: [{ type: 'string' }] },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'sources',
      title: 'Sources',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'id', title: 'ID', type: 'string' },
            { name: 'label', title: 'Label', type: 'string' },
            { name: 'url', title: 'URL', type: 'url' },
            { name: 'checked', title: 'Checked', type: 'date' },
          ],
        },
      ],
    },
  ],
};

const hotelDetailsField = {
  name: 'hotelDetails',
  title: 'Stay Details',
  type: 'object',
  hidden: ({ parent }: HiddenContext) => parent?.category !== 'Hotel',
  fields: [
    { name: 'bookingRef', type: 'string', title: 'Booking Reference' },
    { name: 'roomType', type: 'string', title: 'Room Type' },
    { name: 'checkInNotes', type: 'string', title: 'Check-in Notes' },
  ],
};

const costStructureField = {
  name: 'costStructure',
  title: 'Price & Cancellation',
  type: 'object',
  fields: [
    { name: 'localAmount', title: 'Local Currency Cost (Numeric)', type: 'number' },
    {
      name: 'currencyType',
      title: 'Local Currency Type',
      type: 'string',
      options: {
        list: [
          { title: 'EUR (€)', value: 'EUR' },
          { title: 'CNY (¥)', value: 'CNY' },
          { title: 'JPY (¥)', value: 'JPY' },
          { title: 'CHF (CHF)', value: 'CHF' },
          { title: 'GBP (£)', value: 'GBP' },
        ],
      },
      initialValue: 'EUR',
    },
    { name: 'textFallback', title: 'Price Override String', type: 'string' },
    {
      name: 'cancellationPolicy',
      title: 'Cancellation Terms',
      type: 'string',
      options: {
        list: [
          { title: '❌ Non-refundable', value: 'non-refundable' },
          { title: '🟢 Free Cancellation', value: 'free' },
        ],
      },
    },
    {
      name: 'cancellationDeadline',
      title: 'Free Cancellation Deadline Date',
      type: 'date',
      hidden: ({ parent }: HiddenContext) => parent?.cancellationPolicy !== 'free',
    },
  ],
};

const bookingLogisticsField = {
  name: 'bookingLogistics',
  title: 'Booking Status',
  type: 'object',
  fields: [
    {
      name: 'bookingStatus',
      title: 'Reservation Status',
      type: 'string',
      options: {
        list: [
          { title: '⚪ Not Needed', value: 'not-needed' },
          { title: '⏳ To Book (Action Required)', value: 'to-book' },
          { title: '✅ Booked / Confirmed', value: 'booked' },
        ],
        layout: 'dropdown',
      },
      initialValue: 'not-needed',
      validation: (Rule: ValidationRule) => Rule.required(),
    },
    {
      name: 'bookOnDate',
      title: 'Booking Opening Target Date',
      type: 'date',
      hidden: ({ parent }: HiddenContext) => parent?.bookingStatus !== 'to-book',
    },
  ],
};

const scheduleField = {
  name: 'schedule',
  title: 'Schedule',
  type: 'object',
  description: 'Optional structured timing details. Leave anything blank when plans are flexible or unknown.',
  fields: [
    {
      name: 'date',
      title: 'Date',
      type: 'date',
    },
    {
      name: 'startTime',
      title: 'Start Time',
      type: 'string',
      description: 'Use 24-hour time when known, for example 09:30.',
    },
    {
      name: 'endTime',
      title: 'End Time',
      type: 'string',
      description: 'Use 24-hour time when known, for example 13:00.',
    },
    {
      name: 'duration',
      title: 'Duration',
      type: 'string',
      description: 'Flexible text, for example 1-2 hours, half day, or 3 nights.',
    },
    {
      name: 'suggestedTime',
      title: 'Suggested Time',
      type: 'string',
      description: 'Flexible text, for example morning, after lunch, sunset, or rainy day option.',
    },
    {
      name: 'timingStatus',
      title: 'Timing Status',
      type: 'string',
      options: {
        list: [
          { title: 'Confirmed', value: 'confirmed' },
          { title: 'Estimated', value: 'estimated' },
          { title: 'Flexible', value: 'flexible' },
          { title: 'Opening-hours dependent', value: 'opening-hours-dependent' },
        ],
        layout: 'dropdown',
      },
    },
    {
      name: 'timingNote',
      title: 'Timing Note',
      type: 'text',
      rows: 2,
    },
  ],
  options: {
    collapsible: true,
    collapsed: false,
  },
};

const placeFields = [
  {
    name: 'category',
    title: 'Type of Entry',
    type: 'string',
    options: {
      list: [
        { title: '✈️ Transit (Flight/Rail/Transfer)', value: 'Transit' },
        { title: '🏨 Hotel / Accommodation', value: 'Hotel' },
        { title: '🎟️ Attraction', value: 'Attraction' },
        { title: '🏛️ Museum', value: 'Museum' },
        { title: '🍽️ Food / Restaurant', value: 'Food' },
        { title: '🍸 Bar / Nightlife', value: 'Bar' },
        { title: '🚶 Walk / Route', value: 'Walk' },
        { title: '🛍️ Shopping', value: 'Shopping' },
        { title: '📷 Viewpoint', value: 'Viewpoint' },
        { title: '✨ Other', value: 'Other' },
      ],
    },
    validation: (Rule: ValidationRule) => Rule.required(),
  },
  {
    name: 'placeName',
    title: 'Name / Title of Entry',
    type: 'string',
    validation: (Rule: ValidationRule) => Rule.required(),
  },
  scheduleField,
  transitDetailsField,
  hotelDetailsField,
  {
    name: 'area',
    title: 'Area / District',
    type: 'string',
  },
  {
    name: 'shortDescription',
    title: 'Short Description',
    type: 'text',
    rows: 2,
  },
  {
    name: 'decisionStatus',
    title: 'Decision State',
    type: 'string',
    description: 'Optional planning label for itinerary scanning.',
    options: {
      list: decisionStateOptions,
      layout: 'dropdown',
    },
  },
  {
    name: 'info',
    title: 'Trip Notes',
    type: 'text',
  },
  {
    name: 'practicalInfo',
    title: 'Practical Info',
    type: 'text',
    rows: 3,
  },
  costStructureField,
  bookingLogisticsField,
  {
    name: 'paymentStatus',
    title: 'Payment Status',
    type: 'string',
    description: 'Track internal financial settlement state.',
    options: {
      list: [
        { title: '✅ Paid / Settled', value: 'paid' },
        { title: '⚠️ Not Paid / Balance Outstanding', value: 'unpaid' },
        { title: '❌ N/A (No payment required)', value: 'na' },
      ],
      layout: 'radio',
    },
    initialValue: 'na',
    validation: (Rule: ValidationRule) => Rule.required(),
  },
  {
    name: 'bookingUrl',
    title: 'Direct Reservation Link',
    type: 'url',
  },
  {
    name: 'websiteUrl',
    title: 'Official Resource URL',
    type: 'url',
  },
  {
    name: 'travelNote',
    title: 'Getting There Note',
    type: 'string',
  },
  {
    name: 'photo',
    title: 'Place Photo',
    type: 'image',
    options: { hotspot: true },
  },
  {
    name: 'coordinates',
    title: 'Map Geopoint Coordinates',
    type: 'geopoint',
  },
  {
    name: 'countAsStop',
    title: 'Count as Planned Stop',
    type: 'boolean',
    description: 'Turn off for travel/admin cards that should not be counted as visitable stops on the dashboard.',
    initialValue: true,
  },
  {
    name: 'showOnDashboardMap',
    title: 'Show on Trip Dashboard Map',
    type: 'boolean',
    description: 'Turn off for places that should stay in the itinerary but not appear on the dashboard map.',
    initialValue: true,
  },
];

const placesField = {
  name: 'places',
  title: 'Stops / Plans',
  type: 'array',
  of: [
    {
      name: 'place',
      title: 'Stop / Plan',
      type: 'object',
      fields: placeFields,
      preview: {
        select: {
          title: 'placeName',
          subtitle: 'category',
          media: 'photo',
        },
      },
    },
  ],
};

const sectionsField = {
  name: 'sections',
  title: 'Trip Sections',
  type: 'array',
  of: [
    {
      name: 'section',
      title: 'Section',
      type: 'object',
      fields: [
        {
          name: 'sectionTitle',
          title: 'Section Name',
          type: 'string',
          description: 'Example: "Travel Out", "Beijing", "Places to Eat", "Big Hitters"',
          validation: (Rule: ValidationRule) => Rule.required(),
        },
        {
          name: 'sectionIntro',
          title: 'Section Intro',
          type: 'text',
          description: 'Optional intro text shown inside a panel underneath the section image.',
        },
        {
          name: 'sectionImage',
          title: 'Section Hero Image',
          type: 'image',
          description: 'Optional panoramic asset mapped to this structural itinerary group.',
          options: { hotspot: true },
        },
        {
          name: 'layoutStyle',
          title: 'Layout Style',
          type: 'string',
          options: {
            list: [
              { title: 'Timeline (Chronological / Logistics)', value: 'timeline' },
              { title: 'Grid (Attractions / Browseable)', value: 'grid' },
            ],
            layout: 'radio',
          },
          initialValue: 'timeline',
          validation: (Rule: ValidationRule) => Rule.required(),
        },
        {
          name: 'initialLoadState',
          title: 'Initial Drawer State',
          type: 'string',
          description:
            'Controls whether the collapsible content beneath this section image loads open or closed on the public itinerary page.',
          options: {
            list: [
              { title: 'Load open', value: 'open' },
              { title: 'Load closed', value: 'closed' },
            ],
            layout: 'radio',
          },
          initialValue: 'closed',
          validation: (Rule: ValidationRule) => Rule.required(),
        },
        sectionWeatherConfigField,
        foodShortlistField,
        placesField,
      ],
      preview: {
        select: {
          title: 'sectionTitle',
          layoutStyle: 'layoutStyle',
          initialLoadState: 'initialLoadState',
          media: 'sectionImage',
        },
        prepare({ title, layoutStyle, initialLoadState }: SectionPreviewSelection) {
          const drawerState = initialLoadState === 'open' ? 'Loads open' : 'Loads closed';
          const layoutLabel = layoutStyle === 'grid' ? 'Grid' : 'Timeline';

          return {
            title,
            subtitle: `${layoutLabel} • ${drawerState}`,
          };
        },
      },
    },
  ],
};

const tripSchema = {
  name: 'trip',
  type: 'document',
  title: 'Holiday Itinerary',
  fields: [
    {
      name: 'title',
      type: 'string',
      title: 'Trip Name',
      validation: (Rule: ValidationRule) => Rule.required(),
    },
    {
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule: ValidationRule) => Rule.required(),
    },
    {
      name: 'startDate',
      type: 'date',
      title: 'Departure Date',
      validation: (Rule: ValidationRule) => Rule.required(),
    },
    {
      name: 'displayStatus',
      title: 'Visibility',
      type: 'string',
      description: 'Choose whether this trip appears on the public website.',
      options: {
        list: [
          { title: 'Show on website', value: 'visible' },
          { title: 'Hide from website', value: 'hidden' },
        ],
        layout: 'radio',
      },
      initialValue: 'visible',
      validation: (Rule: ValidationRule) => Rule.required(),
    },
    {
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      description: 'Main image shown in the trip header.',
      options: { hotspot: true },
    },
    {
      name: 'heroIntro',
      title: 'Hero Intro',
      type: 'text',
      description: 'Optional short intro shown over or near the hero image.',
    },
    weatherConfigField,
    transportBriefField,
    sectionsField,
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'startDate',
      media: 'heroImage',
    },
  },
};

export default defineConfig({
  name: 'holiday-planner',
  title: 'Holiday Planner',
  projectId: '943oi1hw',
  dataset: 'production',
  plugins: [structureTool()],
  schema: {
    types: [tripSchema, hotelSearchSchema, weatherIconSetSchema],
  },
});

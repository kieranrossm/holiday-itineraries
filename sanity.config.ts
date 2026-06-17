import { defineConfig } from 'sanity';
import { deskTool } from 'sanity/desk';

export default defineConfig({
  name: 'holiday-planner',
  title: 'Holiday Planner',
  projectId: '943oi1hw',
  dataset: 'production',
  plugins: [deskTool()],
  schema: {
    types: [
      {
        name: 'trip',
        type: 'document',
        title: 'Holiday Itinerary',
        fields: [
          {
            name: 'title',
            type: 'string',
            title: 'Trip Name',
            validation: (Rule) => Rule.required(),
          },
          {
            name: 'slug',
            type: 'slug',
            title: 'Slug',
            options: {
              source: 'title',
              maxLength: 96,
            },
            validation: (Rule) => Rule.required(),
          },
          {
            name: 'startDate',
            type: 'date',
            title: 'Departure Date',
            validation: (Rule) => Rule.required(),
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
            validation: (Rule) => Rule.required(),
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
          {
            name: 'heroWeatherForecast',
            title: 'Hero Weather Forecast',
            type: 'object',
            description: 'Optional live 7-day weather forecast shown near the trip hero image.',
            fields: [
              {
                name: 'enabled',
                title: 'Show Forecast',
                type: 'boolean',
                initialValue: false,
              },
              {
                name: 'locationName',
                title: 'Forecast Location',
                type: 'string',
                description: 'Example: Beijing, China. Used to find the forecast if coordinates are not supplied.',
                hidden: ({ parent }) => !parent?.enabled,
              },
              {
                name: 'coordinates',
                title: 'Forecast Coordinates',
                type: 'geopoint',
                description: 'Optional, but more accurate than the location name.',
                hidden: ({ parent }) => !parent?.enabled,
              },
            ],
          },
          {
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
                    validation: (Rule) => Rule.required(),
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
                    name: 'weatherForecast',
                    title: 'Section Weather Forecast',
                    type: 'object',
                    description: 'Optional live 7-day weather forecast shown underneath this section hero image.',
                    fields: [
                      {
                        name: 'enabled',
                        title: 'Show Forecast',
                        type: 'boolean',
                        initialValue: false,
                      },
                      {
                        name: 'locationName',
                        title: 'Forecast Location',
                        type: 'string',
                        description: 'Example: Beijing, China. Used to find the forecast if coordinates are not supplied.',
                        hidden: ({ parent }) => !parent?.enabled,
                      },
                      {
                        name: 'coordinates',
                        title: 'Forecast Coordinates',
                        type: 'geopoint',
                        description: 'Optional, but more accurate than the location name.',
                        hidden: ({ parent }) => !parent?.enabled,
                      },
                    ],
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
                    validation: (Rule) => Rule.required(),
                  },
                  {
                    name: 'initialLoadState',
                    title: 'Initial Drawer State',
                    type: 'string',
                    description: 'Controls whether the collapsible content beneath this section image loads open or closed on the public itinerary page.',
                    options: {
                      list: [
                        { title: 'Load open', value: 'open' },
                        { title: 'Load closed', value: 'closed' },
                      ],
                      layout: 'radio',
                    },
                    initialValue: 'closed',
                    validation: (Rule) => Rule.required(),
                  },
                  {
                    name: 'places',
                    title: 'Stops / Plans',
                    type: 'array',
                    of: [
                      {
                        name: 'place',
                        title: 'Stop / Plan',
                        type: 'object',
                        fields: [
                          {
                            name: 'category',
                            title: 'Type of Entry',
                            type: 'string',
                            options: {
                              list: [
                                { title: '✈️ Transit (Flight/Rail/Transfer)', value: 'Transit' },
                                { title: '✈️ Transport (Legacy)', value: 'Transport' },
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
                            validation: (Rule) => Rule.required(),
                          },
                          {
                            name: 'placeName',
                            title: 'Name / Title of Entry',
                            type: 'string',
                            validation: (Rule) => Rule.required(),
                          },
                          {
                            name: 'time',
                            title: 'Start Time / Departure Time',
                            type: 'string',
                          },
                          {
                            name: 'endTime',
                            title: 'End Time / Arrival Time',
                            type: 'string',
                          },
                          {
                            name: 'transitDetails',
                            title: 'Journey Details',
                            type: 'object',
                            hidden: ({ parent }) => parent?.category !== 'Transit' && parent?.category !== 'Transport',
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
                                    hidden: ({ parent }) => parent?.status === 'not-needed',
                                  },
                                ],
                              },
                            ],
                          },
                          {
                            name: 'hotelDetails',
                            title: 'Stay Details',
                            type: 'object',
                            hidden: ({ parent }) => parent?.category !== 'Hotel',
                            fields: [
                              { name: 'bookingRef', type: 'string', title: 'Booking Reference' },
                              { name: 'roomType', type: 'string', title: 'Room Type' },
                              { name: 'checkInNotes', type: 'string', title: 'Check-in Notes' },
                            ],
                          },
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
                          {
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
                                hidden: ({ parent }) => parent?.cancellationPolicy !== 'free',
                              },
                            ],
                          },
                          {
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
                                validation: (Rule) => Rule.required(),
                              },
                              {
                                name: 'bookOnDate',
                                title: 'Booking Opening Target Date',
                                type: 'date',
                                hidden: ({ parent }) => parent?.bookingStatus !== 'to-book',
                              },
                            ],
                          },
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
                            validation: (Rule) => Rule.required(),
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
                        ],
                        preview: {
                          select: {
                            title: 'placeName',
                            subtitle: 'category',
                            media: 'photo',
                          },
                        },
                      },
                    ],
                  },
                ],
                preview: {
                  select: {
                    title: 'sectionTitle',
                    layoutStyle: 'layoutStyle',
                    initialLoadState: 'initialLoadState',
                    weatherEnabled: 'weatherForecast.enabled',
                    media: 'sectionImage',
                  },
                  prepare({ title, layoutStyle, initialLoadState, weatherEnabled }) {
                    const drawerState = initialLoadState === 'open' ? 'Loads open' : 'Loads closed';
                    const layoutLabel = layoutStyle === 'grid' ? 'Grid' : 'Timeline';
                    const weatherLabel = weatherEnabled ? 'Weather on' : 'Weather off';

                    return {
                      title,
                      subtitle: `${layoutLabel} • ${drawerState} • ${weatherLabel}`,
                    };
                  },
                },
              },
            ],
          },
        ],
        preview: {
          select: {
            title: 'title',
            subtitle: 'startDate',
            media: 'heroImage',
          },
        },
      },
    ],
  },
});

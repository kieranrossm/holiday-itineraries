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
              maxLength: 96
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
            name: 'sections',
            title: 'Page Sections',
            type: 'array',
            of: [
              {
                name: 'section',
                title: 'Section',
                type: 'object',
                fields: [
                  {
                    name: 'sectionTitle',
                    title: 'Section Header',
                    type: 'string',
                    description: 'Example: "Day 1: Old Town", "Places to Eat", "Big Hitters"',
                    validation: (Rule) => Rule.required(),
                  },
                  {
                    name: 'sectionIntro',
                    title: 'Section Intro',
                    type: 'text',
                    description: 'Optional intro text shown underneath the section heading.',
                  },
                  {
                    name: 'layoutStyle',
                    title: 'Layout Style',
                    type: 'string',
                    options: {
                      list: [
                        { title: 'Timeline (Chronological)', value: 'timeline' },
                        { title: 'Grid (Categorical)', value: 'grid' },
                      ],
                      layout: 'radio',
                    },
                    initialValue: 'timeline',
                    validation: (Rule) => Rule.required(),
                  },
                  {
                    name: 'places',
                    title: 'Places / Logistics Elements',
                    type: 'array',
                    of: [
                      {
                        name: 'place',
                        title: 'Item Entry',
                        type: 'object',
                        fields: [
                          {
                            name: 'category',
                            title: 'Type of Entry',
                            type: 'string',
                            options: {
                              list: [
                                { title: '✈️ Transport (Flight/Rail/Transfer)', value: 'Transport' },
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
                            description: 'e.g. "Qatar Qsuites QR28", "TRIBE Krakow Old Town", "Louvre Museum"',
                            validation: (Rule) => Rule.required(),
                          },
                          {
                            name: 'time',
                            title: 'Start Time / Departure Time',
                            type: 'string',
                            description: 'Format: HH:MM (e.g. 13:30)',
                          },
                          {
                            name: 'endTime',
                            title: 'End Time / Arrival Time',
                            type: 'string',
                            description: 'Format: HH:MM (e.g. 15:00)',
                          },
                          
                          // --- TRANSPORT EXCLUSIVE FIELDS ---
                          {
                            name: 'transitDetails',
                            title: 'Transit Connection Details',
                            type: 'object',
                            hidden: ({ parent }) => parent?.category !== 'Transport',
                            fields: [
                              { name: 'origin', type: 'string', title: 'Origin Station/Airport' },
                              { name: 'destination', type: 'string', title: 'Destination Station/Airport' },
                              { name: 'carrier', type: 'string', title: 'Carrier / Line Name (e.g. Eurostar, China Railway)' },
                              { name: 'reference', type: 'string', title: 'Flight / Train / Booking Reference Number' },
                              { name: 'seatAssignment', type: 'string', title: 'Seat / Class Assignment' },
                            ]
                          },

                          // --- HOTEL EXCLUSIVE FIELDS ---
                          {
                            name: 'hotelDetails',
                            title: 'Hotel Check-in Details',
                            type: 'object',
                            hidden: ({ parent }) => parent?.category !== 'Hotel',
                            fields: [
                              { name: 'bookingRef', type: 'string', title: 'Booking Confirmation Reference' },
                              { name: 'roomType', type: 'string', title: 'Room Description / Tier booked' },
                              { name: 'checkInNotes', type: 'string', title: 'Check-in Policy / Luggage Hold Notes' },
                            ]
                          },

                          {
                            name: 'area',
                            title: 'Area / District',
                            type: 'string',
                            description: 'Example: Old Town, Shinjuku, Futian.',
                          },
                          {
                            name: 'shortDescription',
                            title: 'Short Description',
                            type: 'text',
                            rows: 2,
                            description: 'High-density summary sentence displayed prominently at top.',
                          },
                          {
                            name: 'info',
                            title: 'Information & Strategic Notes',
                            type: 'text',
                            description: 'Comprehensive workflow observations. Line breaks are outputted directly.',
                          },
                          {
                            name: 'practicalInfo',
                            title: 'Practical Info',
                            type: 'text',
                            rows: 3,
                            description: 'Dress codes, booking logic windows, or optimal security line parameters.',
                          },

                          // --- METRIC DATA HANDLING: AUTOMATED CURRENCY COUPLING ---
                          {
                            name: 'costStructure',
                            title: 'Pricing Logistics Metrics',
                            type: 'object',
                            options: { columns: 2 },
                            fields: [
                              {
                                name: 'localAmount',
                                title: 'Local Currency Cost (Numeric Amount)',
                                type: 'number',
                                description: 'Leave empty if completely free.'
                              },
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
                                  ]
                                },
                                initialValue: 'EUR'
                              },
                              {
                                name: 'textFallback',
                                title: 'Price Guide Override String',
                                type: 'string',
                                description: 'Fallback string structure if exact metrics are unavailable (e.g. "Free", "££", "€15 entry").'
                              }
                            ]
                          },

                          {
                            name: 'bookingRequired',
                            title: 'Booking Explicitly Required',
                            type: 'boolean',
                            initialValue: false,
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
                            title: 'Micro Transit Connection Instruction',
                            type: 'string',
                            description: 'Example: "12 min rapid rail exit 3B."',
                          },
                          {
                            name: 'photo',
                            title: 'Visual Verification Asset',
                            type: 'image',
                            options: { hotspot: true },
                          },
                          {
                            name: 'coordinates',
                            title: 'Map Geopoint Coordinates',
                            type: 'geopoint',
                            description: 'Enables mobile-ready clipboard coordinate targets.',
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
                    subtitle: 'layoutStyle',
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

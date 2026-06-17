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
                            title: 'Transit Connection Details',
                            type: 'object',
                            hidden: ({ parent }) => parent?.category !== 'Transport',
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
                                        { title: '✅ Booked', value: 'booked' }
                                      ]
                                    },
                                    initialValue: 'not-needed'
                                  },
                                  {
                                    name: 'locationInfo',
                                    title: 'Car Park Location / Terminal Area',
                                    type: 'string',
                                    hidden: ({ parent }) => parent?.status === 'not-needed'
                                  }
                                ]
                              }
                            ]
                          },
                          {
                            name: 'hotelDetails',
                            title: 'Hotel Check-in Details',
                            type: 'object',
                            hidden: ({ parent }) => parent?.category !== 'Hotel',
                            fields: [
                              { name: 'bookingRef', type: 'string', title: 'Booking Reference' },
                              { name: 'roomType', type: 'string', title: 'Room Type' },
                              { name: 'checkInNotes', type: 'string', title: 'Check-in Notes' },
                            ]
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
                            title: 'Information & Strategic Notes',
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
                            title: 'Pricing Logistics Metrics',
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
                                  ]
                                },
                                initialValue: 'EUR'
                              },
                              { name: 'textFallback', title: 'Price Override String', type: 'string' },
                              {
                                name: 'cancellationPolicy',
                                title: 'Cancellation Terms',
                                type: 'string',
                                options: {
                                  list: [
                                    { title: '❌ Non-refundable', value: 'non-refundable' },
                                    { title: '🟢 Free Cancellation', value: 'free' }
                                  ]
                                }
                              },
                              {
                                name: 'cancellationDeadline',
                                title: 'Free Cancellation Deadline Date',
                                type: 'date',
                                hidden: ({ parent }) => parent?.cancellationPolicy !== 'free'
                              }
                            ]
                          },
                          {
                            name: 'bookingLogistics',
                            title: 'Booking & Ticket Lifecycle Logistics',
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
                                    { title: '✅ Booked / Confirmed', value: 'booked' }
                                  ],
                                  layout: 'dropdown'
                                },
                                initialValue: 'not-needed',
                                validation: (Rule) => Rule.required(),
                              },
                              {
                                name: 'bookOnDate',
                                title: 'Booking Opening Target Date',
                                type: 'date',
                                hidden: ({ parent }) => parent?.bookingStatus !== 'to-book'
                              }
                            ]
                          },
                          {
                            name: 'paymentStatus',
                            title: 'Operational Payment Status',
                            type: 'string',
                            description: 'Track internal financial settlement state.',
                            options: {
                              list: [
                                { title: '✅ Paid / Settled', value: 'paid' },
                                { title: '⚠️ Not Paid / Balance Outstanding', value: 'unpaid' },
                                { title: '❌ N/A (No payment required)', value: 'na' }
                              ],
                              layout: 'radio'
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
                            title: 'Micro Transit Connection Instruction',
                            type: 'string',
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

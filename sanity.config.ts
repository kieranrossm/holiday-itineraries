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
            options: { source: 'title' },
          },
          {
            name: 'startDate',
            type: 'date',
            title: 'Departure Date',
            validation: (Rule) => Rule.required(),
          },
          {name: 'displayStatus',
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
                    title: 'Places',
                    type: 'array',
                    of: [
                      {
                        name: 'place',
                        title: 'Place',
                        type: 'object',
                        fields: [
                          {
                            name: 'placeName',
                            title: 'Location Name',
                            type: 'string',
                            validation: (Rule) => Rule.required(),
                          },
                          {
                            name: 'time',
                            title: 'Start Time',
                            type: 'string',
                            description: 'Optional. Example: 09:30. Leave blank for categorical lists.',
                          },
                          {
                            name: 'endTime',
                            title: 'End Time',
                            type: 'string',
                            description: 'Optional. Example: 11:00.',
                          },
                          {
                            name: 'category',
                            title: 'Category',
                            type: 'string',
                            options: {
                              list: [
                                { title: 'Attraction', value: 'Attraction' },
                                { title: 'Museum', value: 'Museum' },
                                { title: 'Food', value: 'Food' },
                                { title: 'Bar', value: 'Bar' },
                                { title: 'Hotel', value: 'Hotel' },
                                { title: 'Transport', value: 'Transport' },
                                { title: 'Walk', value: 'Walk' },
                                { title: 'Shopping', value: 'Shopping' },
                                { title: 'Viewpoint', value: 'Viewpoint' },
                                { title: 'Other', value: 'Other' },
                              ],
                            },
                          },
                          {
                            name: 'area',
                            title: 'Area',
                            type: 'string',
                            description: 'Example: Old Town, Kazimierz, Grünerløkka.',
                          },
                          {
                            name: 'shortDescription',
                            title: 'Short Description',
                            type: 'text',
                            description: 'One or two sentence summary shown near the top of the card.',
                          },
                          {
                            name: 'info',
                            title: 'Information & Notes',
                            type: 'text',
                            description: 'Longer notes. Line breaks will be preserved on the site.',
                          },
                          {
                            name: 'practicalInfo',
                            title: 'Practical Info',
                            type: 'text',
                            description: 'Opening hours, entry notes, dress code, booking tips, etc.',
                          },
                          {
                            name: 'priceGuide',
                            title: 'Price Guide',
                            type: 'string',
                            description: 'Example: Free, £, ££, £££, €15 entry.',
                          },
                          {
                            name: 'bookingRequired',
                            title: 'Booking Required',
                            type: 'boolean',
                            initialValue: false,
                          },
                          {
                            name: 'bookingUrl',
                            title: 'Booking URL',
                            type: 'url',
                          },
                          {
                            name: 'websiteUrl',
                            title: 'Website URL',
                            type: 'url',
                          },
                          {
                            name: 'travelNote',
                            title: 'Travel Note',
                            type: 'string',
                            description: 'Example: 15 min walk from hotel.',
                          },
                          {
                            name: 'photo',
                            title: 'Photo',
                            type: 'image',
                            options: { hotspot: true },
                          },
                          {
                            name: 'coordinates',
                            title: 'Map Coordinates',
                            type: 'geopoint',
                            description: 'Optional. Stored for later, not currently shown on the page.',
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

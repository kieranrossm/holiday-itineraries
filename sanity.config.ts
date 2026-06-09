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
            options: { source: 'title' } 
          },
          { 
            name: 'startDate', 
            type: 'date', 
            title: 'Departure Date',
            validation: (Rule) => Rule.required(),
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
                    description: 'e.g., "Day 1: Old Town" OR "Places to Eat"',
                    validation: (Rule) => Rule.required(),
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
                            title: 'Time',
                            type: 'string',
                            description: 'Leave blank for categorical lists.',
                          },
                          {
                            name: 'info',
                            title: 'Information & Notes',
                            type: 'text',
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
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          }
        ]
      }
    ],
  },
});

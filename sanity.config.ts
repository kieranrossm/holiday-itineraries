import { defineConfig } from 'sanity';
import { deskTool } from 'sanity/desk';

export default defineConfig({
  name: 'default',
  title: 'Holiday Planner',

  projectId: 'm8dqz3g',
  dataset: 'production',

  plugins: [deskTool()],

  schema: {
    types: [
      {
        name: 'trip',
        type: 'document',
        title: 'Holiday Itinerary',
        fields: [
          { name: 'title', type: 'string', title: 'Trip Name (e.g., China 2027)' },
          { name: 'slug', type: 'slug', title: 'Slug', options: { source: 'title' } },
          { name: 'startDate', type: 'date', title: 'Departure Date' },
          {
            name: 'itineraryDays',
            type: 'array',
            title: 'Daily Schedule Log',
            of: [{
              type: 'object',
              name: 'itineraryDayItem', // This specific explicit name string stops schema_validation: failed
              fields: [
                { name: 'dayNumber', type: 'number', title: 'Day Number' },
                { name: 'dateLabel', type: 'string', title: 'Date' },
                { name: 'description', type: 'text', title: 'Activities & Transport' }
              ]
            }]
          }
        ]
      }
    ],
  },
});

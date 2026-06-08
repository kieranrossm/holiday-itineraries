import { defineConfig } from 'astro/config';
import sanity from '@sanity/astro';
import react from '@astrojs/react';

export default defineConfig({
  // Force hybrid mode so Astro can render the dynamic admin dashboard canvas
  output: 'hybrid',
  integrations: [
    sanity({
      projectId: 'm8dqz3g',
      dataset: 'production',
      useCdn: false,
      studioBasePath: '/admin', // This hosts your panel at holiday-itineraries.pages.dev/admin
    }),
    react(),
  ],
});

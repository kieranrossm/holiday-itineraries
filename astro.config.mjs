import { defineConfig } from 'astro/config';
import sanity from '@sanity/astro';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [
    sanity({
      projectId: '943oi1hw',
      dataset: 'production',
      useCdn: false,
      studioBasePath: '/admin',
    }),
    react(),
  ],
});

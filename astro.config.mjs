import { defineConfig } from 'astro/config';
import sanity from '@sanity/astro';
import react from '@astrojs/react';

export default defineConfig({
  output: 'hybrid',
  integrations: [
    sanity({
      projectId: 'm8dqz3g',
      dataset: 'production',
      useCdn: false,
      studioBasePath: '/admin',
    }),
    react(),
  ],
});

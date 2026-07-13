/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly GOOGLE_MAPS_API_KEY?: string;
  readonly PUBLIC_GOOGLE_MAPS_STATIC_API_KEY?: string;
}

declare module "sanity:client" {
  export const sanityClient: {
    fetch: <T = any>(query: string, params?: Record<string, unknown>) => Promise<T>;
  };
}

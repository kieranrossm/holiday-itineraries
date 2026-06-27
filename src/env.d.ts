/// <reference types="astro/client" />

declare module "sanity:client" {
  export const sanityClient: {
    fetch: <T = any>(query: string, params?: Record<string, unknown>) => Promise<T>;
  };
}

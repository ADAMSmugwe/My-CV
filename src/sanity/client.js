import { createClient } from '@sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url';

export const client = createClient({
  projectId: '79b8oplb',
  dataset: 'production',
  useCdn: true, // set to `false` to bypass the edge cache
  apiVersion: '2024-01-01', // use current date (YYYY-MM-DD) to target the latest API version
});

// Helper function for generating image URLs
const builder = createImageUrlBuilder(client);

export const urlFor = (source) => builder.image(source);

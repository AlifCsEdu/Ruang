import { defineCollection, z } from 'astro:content';
import { file } from 'astro/loaders';

const duas = defineCollection({
  loader: file('src/data/duas.json'),
  schema: z.object({
    title: z.string(),
    titleAr: z.string(),
    category: z.string(),
    arabic: z.string(),
    transliteration: z.string(),
    translation: z.string(),
    reference: z.string(),
  }),
});

export const collections = { duas };

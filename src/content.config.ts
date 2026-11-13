import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdoc}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    titleEn: z.string().optional(),
    titleEs: z.string().optional(),
    titleZh: z.string().optional(),
    date: z.coerce.date(),
    excerpt: z.string().optional().default(''),
    excerptEn: z.string().optional(),
    excerptEs: z.string().optional(),
    excerptZh: z.string().optional(),
    bodyEn: z.string().optional(),
    bodyEs: z.string().optional(),
    bodyZh: z.string().optional(),
    noteUrl: z.string().url().optional(),
    lang: z.enum(['ja', 'en']).default('ja'),
  }),
});

const works = defineCollection({
  loader: glob({ pattern: '*.{md,mdoc}', base: './src/content/works' }),
  schema: z.object({
    title: z.string(),
    titleEn: z.string(),
    titleEs: z.string().optional(),
    titleZh: z.string().optional(),
    order: z.number(),
    status: z.enum(['released', 'preview', 'wip']),
    category: z.enum(['life', 'map', 'creative', 'play']),
    platforms: z.array(z.enum(['ios', 'android', 'web'])),
    summary: z.string(),
    summaryEn: z.string(),
    summaryEs: z.string().optional(),
    summaryZh: z.string().optional(),
    featured: z.boolean().default(false),
    gallery: z.enum(['featured', 'others']).default('others'),
    icon: z.string().optional(),
    screenshots: z.array(z.string()).optional(),
    /** How many screenshots / body images per row (Keystatic may store string) */
    imageColumns: z.union([z.string(), z.number()]).optional(),
    appStore: z.string().url().optional(),
    playStore: z.string().url().optional(),
    webUrl: z.string().url().optional(),
    contentEn: z.string().optional(),
    contentEs: z.string().optional(),
    contentZh: z.string().optional(),
  }),
});

export const collections = { blog, works };

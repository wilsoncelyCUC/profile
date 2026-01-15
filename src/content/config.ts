import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const servicesCollection = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/services' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    order: z.number(),
    icon: z.enum(['rocket', 'lightbulb', 'trending-up']),
    hook: z.string(),
    tagline: z.string(),
    bestFor: z.string(),
    outcome: z.string(),
    deliverables: z.array(z.string()),
    format: z.string(),
    ctaText: z.string().default('Request scope'),
  }),
});

const caseStudiesCollection = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/case-studies' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    order: z.number(),
    context: z.string(),
    outcome: z.string(),
    metrics: z.array(z.string()).optional(),
    link: z.string().optional(),
    tags: z.array(z.string()).optional(),
    featured: z.boolean().default(false),
  }),
});

export const collections = {
  services: servicesCollection,
  'case-studies': caseStudiesCollection,
};

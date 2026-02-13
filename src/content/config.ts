import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const servicesCollection = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/services' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    order: z.number(),
    pillar: z.enum(['build', 'ship', 'prove', 'poc']),
    scopeTitle: z.string().optional(),
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
    industry: z.string(),
    context: z.string(),
    challenge: z.string(),
    actions: z.array(z.string()),
    outcome: z.string(),
    pillar: z.enum(['build', 'ship', 'prove']),
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

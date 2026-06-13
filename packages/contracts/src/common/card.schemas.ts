import { z } from 'zod';

export const cardTypeSchema = z.enum([
  'characters',
  'items',
  'fruits',
  'swords',
  'boats',
]);

export const characterCardSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    image: z.string(),
    type: z.array(z.string()).optional(),
    abilities: z.array(z.string()).optional(),
    bounty: z.array(z.number()).optional(),
    fruit: z.string().nullish(),
    crew: z.string().optional(),
    position: z.string().optional(),
  })
  .loose();

export const itemCardSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    image: z.string(),
    type: z.string().optional(),
    owner: z.string().optional(),
    origin: z.string().optional(),
  })
  .loose();

export const fruitCardSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    image: z.string(),
    roman_name: z.string().optional(),
    type: z.string().optional(),
    description: z.string().optional(),
    current_user: z.string().optional(),
  })
  .loose();

export const swordCardSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    image: z.string(),
    grade: z.string().optional(),
    type: z.string().optional(),
    description: z.string().optional(),
    current_owner: z.string().optional(),
  })
  .loose();

export const boatCardSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    image: z.string(),
    type: z.string().optional(),
    crew: z.union([z.string(), z.array(z.string())]).optional(),
    description: z.string().optional(),
  })
  .loose();

export const catalogByTypeSchema = z.object({
  characters: z.array(characterCardSchema),
  items: z.array(itemCardSchema),
  fruits: z.array(fruitCardSchema),
  swords: z.array(swordCardSchema),
  boats: z.array(boatCardSchema),
});

export const catalogTotalsSchema = z.object({
  characters: z.number(),
  items: z.number(),
  fruits: z.number(),
  swords: z.number(),
  boats: z.number(),
  all: z.number(),
});

export const catalogOutputSchema = catalogByTypeSchema.extend({
  totals: catalogTotalsSchema,
});

export const collectionCountsSchema = z.object({
  characters: z.number(),
  items: z.number(),
  fruits: z.number(),
  swords: z.number(),
  boats: z.number(),
  total: z.number(),
});

export const collectionProgressSchema = z.object({
  characters: z.string(),
  items: z.string(),
  fruits: z.string(),
  swords: z.string(),
  boats: z.string(),
  total: z.string(),
});

export const collectionOutputSchema = z.object({
  unlocked: catalogByTypeSchema,
  counts: collectionCountsSchema,
  progress: collectionProgressSchema,
});

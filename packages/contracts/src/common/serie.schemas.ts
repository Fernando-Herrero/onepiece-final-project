import * as z from 'zod/v4';

import { unlockedCardsSchema } from './user.schemas.js';

export const sagaSchema = z.object({
  slug: z.string(),
  totalArcs: z.number().int().nonnegative(),
  totalEpisodes: z.number().int().nonnegative(),
});

export const arcSchema = z.object({
  slug: z.string(),
  sagaSlug: z.string(),
  type: z.enum(['canon', 'filler', 'mixed']),
  totalEpisodes: z.number().int().nonnegative(),
});

export const episodeSchema = z.object({
  number: z.number().int().positive(),
  arcSlug: z.string(),
  experience: z.number().int().nonnegative(),
  rewards: unlockedCardsSchema,
});

export const sagaListOutputSchema = z.object({
  sagas: z.array(sagaSchema),
  total: z.number().int().nonnegative(),
});

export const arcListOutputSchema = z.object({
  sagaSlug: z.string(),
  arcs: z.array(arcSchema),
  total: z.number().int().nonnegative(),
});

export const episodeListOutputSchema = z.object({
  arcSlug: z.string(),
  episodes: z.array(episodeSchema),
  total: z.number().int().nonnegative(),
});

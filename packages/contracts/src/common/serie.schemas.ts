import { z } from 'zod';

import { unlockedCardsSchema } from './user.schemas.js';

export const sagaSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  titleJa: z.string(),
  totalEpisodes: z.number().int().nonnegative(),
  firstArc: z.number().int().positive(),
  lastArc: z.number().int().positive(),
  arcNames: z.array(z.string()),
});

export const arcSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  description: z.string(),
  saga: z.string(),
  sagaId: z.number().int().positive(),
  totalEpisodes: z.number().int().nonnegative(),
  isFiller: z.boolean(),
  firstEpisode: z.number().int().positive(),
  lastEpisode: z.number().int().positive(),
});

export const episodeSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  description: z.string(),
  arc: z.string(),
  experience: z.number().int().nonnegative(),
  achievements: unlockedCardsSchema,
});

export const sagaListOutputSchema = z.object({
  sagas: z.array(sagaSchema),
  total: z.number().int().nonnegative(),
});

export const arcListOutputSchema = z.object({
  sagaId: z.number().int().positive(),
  arcs: z.array(arcSchema),
  total: z.number().int().nonnegative(),
});

export const episodeListOutputSchema = z.object({
  arcId: z.number().int().positive(),
  episodes: z.array(episodeSchema),
  total: z.number().int().nonnegative(),
});

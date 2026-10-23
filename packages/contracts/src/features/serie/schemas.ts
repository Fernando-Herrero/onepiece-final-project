import * as z from 'zod/v4';

import { episodeSchema } from '../../common/serie.schemas.js';

export const sagaSlugParamsSchema = z.object({
  params: z.object({ sagaSlug: z.string() }),
});

export const arcSlugParamsSchema = z.object({
  params: z.object({ arcSlug: z.string() }),
});

export const episodeNumberParamsSchema = z.object({
  params: z.object({
    episodeNumber: z.coerce.number().int().positive(),
  }),
});

export const episodeOutputSchema = episodeSchema;

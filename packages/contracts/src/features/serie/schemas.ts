import { z } from 'zod';

import { episodeSchema } from '../../common/serie.schemas.js';

export const sagaIdParamsSchema = z.object({
  params: z.object({
    sagaId: z.coerce.number().int().positive(),
  }),
});

export const arcIdParamsSchema = z.object({
  params: z.object({
    arcId: z.coerce.number().int().positive(),
  }),
});

export const episodeIdParamsSchema = z.object({
  params: z.object({
    episodeId: z.coerce.number().int().positive(),
  }),
});

export const episodeOutputSchema = episodeSchema;

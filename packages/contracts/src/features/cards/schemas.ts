import { z } from 'zod';
import { mongoIdParamsSchema } from '../../common/id.schemas.js';
import { cardTypeSchema } from '../../common/card.schemas.js';

export const cardTypeParamsSchema = z.object({
  params: z.object({
    type: cardTypeSchema,
  }),
});

export const cardUserIdParamsSchema = mongoIdParamsSchema('userId');

export const characterIdParamsSchema = z.object({
  params: z.object({
    characterId: z.coerce.number().int().positive(),
  }),
});

const catalogCardSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    image: z.string(),
  })
  .loose();

export const catalogTypeOutputSchema = z.object({
  type: cardTypeSchema,
  cards: z.array(catalogCardSchema),
  total: z.number(),
});

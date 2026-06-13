import { z } from 'zod';
import { mongoIdParamsSchema } from '../../common/user.schemas.js';
import { cardTypeSchema } from '../../common/card.schemas.js';

export const cardTypeParamsSchema = z.object({
  params: z.object({
    type: cardTypeSchema,
  }),
});

export const cardUserIdParamsSchema = mongoIdParamsSchema('userId');

const catalogCardSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    image: z.string(),
  })
  .passthrough();

export const catalogTypeOutputSchema = z.object({
  type: cardTypeSchema,
  cards: z.array(catalogCardSchema),
  total: z.number(),
});

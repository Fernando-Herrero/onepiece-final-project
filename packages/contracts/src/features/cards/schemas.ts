import { z } from 'zod';
import { mongoIdSchema } from '../../common/user.schemas.js';
import {
  cardTypeSchema,
  catalogOutputSchema,
  collectionOutputSchema,
} from '../../common/card.schemas.js';

export const cardTypeParamsSchema = z.object({
  params: z.object({
    type: cardTypeSchema,
  }),
});

export const cardUserIdParamsSchema = z.object({
  params: z.object({
    userId: mongoIdSchema,
  }),
});

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

export {
  catalogOutputSchema,
  collectionOutputSchema,
};

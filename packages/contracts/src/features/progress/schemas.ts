import { z } from 'zod';
import {
  serieProgressSchema,
  unlockedCardsSchema,
} from '../../common/user.schemas.js';
import { catalogByTypeSchema } from '../../common/card.schemas.js';

export const progressMeSchema = z.object({
  serieProgress: serieProgressSchema,
  experience: z.number(),
});

export const updateProgressInputSchema = z
  .object({
    serieProgress: serieProgressSchema.partial().optional(),
    experience: z.number().optional(),
  })
  .strict()
  .refine(data => Object.keys(data).length > 0, {
    message: 'Debes enviar al menos un campo para actualizar',
  });

export const completeEpisodeInputSchema = z.object({
  params: z.object({
    episodeId: z.coerce.number().int().positive(),
  }),
  body: z.object({
    sagaId: z.number().int().nonnegative(),
    arcId: z.number().int().nonnegative(),
    experienceGain: z.number().int().nonnegative(),
    cardsToUnlock: unlockedCardsSchema,
  }),
});

export const completeEpisodeOutputSchema = progressMeSchema.extend({
  newlyUnlocked: catalogByTypeSchema,
});

export const resetProgressOutputSchema = progressMeSchema.extend({
  unlockedCards: unlockedCardsSchema,
});

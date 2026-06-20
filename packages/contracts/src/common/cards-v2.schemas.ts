import { z } from 'zod';

export const cardRaritySchema = z.enum([
  'common',
  'uncommon',
  'rare',
  'legendary',
]);

export const cardCategorySchema = z.enum([
  'character',
  'item',
  'fruit',
  'sword',
  'boat',
]);

export const cardUnlockSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('episode'),
    episodeId: z.number().int().positive(),
  }),
  z.object({
    kind: z.literal('arc'),
    arcId: z.number().int().positive(),
  }),
  z.object({
    kind: z.literal('event'),
    eventId: z.number().int().positive(),
  }),
]);

export const characterSchema = z.object({
  id: z.number().int().positive(),
  slug: z.string(),
  name: z.string(),
  crew: z.string().optional(),
  position: z.string().optional(),
  fruit: z.string().nullish(),
});

export const versionedCardSchema = z.object({
  id: z.number().int().positive(),
  category: cardCategorySchema,
  refId: z.number().int().positive().optional(),
  slug: z.string(),
  title: z.string(),
  rarity: cardRaritySchema,
  image: z.string(),
  description: z.string().optional(),
  abilities: z.array(z.string()).optional(),
  bounty: z.number().optional(),
  unlock: cardUnlockSchema,
});

export const characterListOutputSchema = z.object({
  characters: z.array(characterSchema),
  total: z.number().int().nonnegative(),
});

export const versionedCatalogOutputSchema = z.object({
  cards: z.array(versionedCardSchema),
  total: z.number().int().nonnegative(),
});

export const characterCardsOutputSchema = z.object({
  characterId: z.number().int().positive(),
  character: characterSchema,
  cards: z.array(versionedCardSchema),
  total: z.number().int().nonnegative(),
});

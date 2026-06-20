export const cardsKeys = {
  all: ['cards'] as const,
  charactersV2: () => [...cardsKeys.all, 'v2', 'characters'] as const,
  catalogV2: () => [...cardsKeys.all, 'v2', 'catalog'] as const,
  characterCardsV2: (characterId: number) =>
    [...cardsKeys.all, 'v2', 'character-cards', characterId] as const,
};

import { queryOptions } from '@tanstack/react-query';

import { cardsKeys } from '@/features/cards/api/cards.keys';
import type { OrpcClient } from '@/integrations/orpc/orpc.client';

export const getCardsQueriesOptions = (client: OrpcClient) => ({
  charactersV2: () =>
    queryOptions({
      queryKey: cardsKeys.charactersV2(),
      queryFn: () => client.cards.listCharactersV2(),
    }),

  catalogV2: () =>
    queryOptions({
      queryKey: cardsKeys.catalogV2(),
      queryFn: () => client.cards.getCatalogV2(),
    }),

  characterCardsV2: (characterId: number) =>
    queryOptions({
      queryKey: cardsKeys.characterCardsV2(characterId),
      queryFn: () =>
        client.cards.listCharacterCardsV2({ params: { characterId } }),
      enabled: characterId > 0,
    }),
});

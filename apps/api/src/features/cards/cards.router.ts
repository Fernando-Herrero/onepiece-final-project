import { contract } from '@logpose/contracts/contract';
import { implement, ORPCError } from '@orpc/server';

import {
  type ApiContext,
  requireAuth,
} from '../../integrations/orpc/auth.middleware.js';
import { User } from '../users/user.model.js';
import {
  getCardsV2ByCharacterId,
  getCardsV2Data,
  getCharacterV2ById,
  getCharactersV2Data,
} from './cards-v2-data.js';
import {
  buildCollectionStats,
  type CardType,
  getCatalogByType,
  getCatalogData,
  getCatalogTotals,
} from './catalog.js';

const os = implement(contract.cards).$context<ApiContext>();

const getCatalog = os.getCatalog.handler(async () => {
  const catalog = getCatalogData();
  return { ...catalog, totals: getCatalogTotals() };
});

const getCatalogByTypeHandler = os.getCatalogByType.handler(
  async ({ input }) => {
    const type = input.params.type as CardType;
    const cards = getCatalogByType(type);

    return {
      type,
      cards,
      total: cards.length,
    };
  },
);

const getMyCollection = os.getMyCollection
  .use(requireAuth)
  .handler(async ({ context }) => {
    const user = await User.findById(context.user!.id);

    if (!user) {
      throw new ORPCError('UNAUTHORIZED');
    }

    return buildCollectionStats(user.unlockedCards);
  });

const getMyCollectionByType = os.getMyCollectionByType
  .use(requireAuth)
  .handler(async ({ input, context }) => {
    const user = await User.findById(context.user!.id);

    if (!user) {
      throw new ORPCError('UNAUTHORIZED');
    }

    const type = input.params.type as CardType;
    const { unlocked } = buildCollectionStats(user.unlockedCards);

    return {
      type,
      cards: unlocked[type],
      total: unlocked[type].length,
    };
  });

const getUserCollection = os.getUserCollection
  .use(requireAuth)
  .handler(async ({ input }) => {
    const user = await User.findById(input.params.userId);

    if (!user) {
      throw new ORPCError('USER_NOT_FOUND');
    }

    return buildCollectionStats(user.unlockedCards);
  });

const listCharactersV2 = os.listCharactersV2.handler(async () => {
  const characters = getCharactersV2Data();

  return {
    characters,
    total: characters.length,
  };
});

const getCatalogV2 = os.getCatalogV2.handler(async () => {
  const cards = getCardsV2Data();

  return {
    cards,
    total: cards.length,
  };
});

const listCharacterCardsV2 = os.listCharacterCardsV2.handler(
  async ({ input }) => {
    const characterId = input.params.characterId;
    const character = getCharacterV2ById(characterId);

    if (!character) {
      throw new ORPCError('CHARACTER_NOT_FOUND');
    }

    const cards = getCardsV2ByCharacterId(characterId);

    return {
      characterId,
      character,
      cards,
      total: cards.length,
    };
  },
);

export const cardsRouter = os.router({
  getCatalog,
  getCatalogByType: getCatalogByTypeHandler,
  getMyCollection,
  getMyCollectionByType,
  getUserCollection,
  listCharactersV2,
  getCatalogV2,
  listCharacterCardsV2,
});

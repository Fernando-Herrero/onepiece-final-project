import { contract } from '@logpose/contracts/contract';
import { implement, ORPCError } from '@orpc/server';

import {
  type ApiContext,
  requireAuth,
} from '../../integrations/orpc/auth.middleware.js';
import { User } from '../users/user.model.js';
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

export const cardsRouter = os.router({
  getCatalog,
  getCatalogByType: getCatalogByTypeHandler,
  getMyCollection,
  getMyCollectionByType,
  getUserCollection,
});

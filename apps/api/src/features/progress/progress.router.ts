import { contract } from '@logpose/contracts/contract';
import { implement, ORPCError } from '@orpc/server';

import {
  type ApiContext,
  requireAuth,
} from '../../integrations/orpc/auth.middleware.js';
import { isProgressGreater, mergeUnlockedCards } from '../cards/catalog.js';
import { User } from '../users/user.model.js';

const os = implement(contract.progress).$context<ApiContext>();

async function loadAuthUser(userId: string) {
  const user = await User.findById(userId);

  if (!user) {
    throw new ORPCError('UNAUTHORIZED');
  }

  return user;
}

const getMe = os.getMe.use(requireAuth).handler(async ({ context }) => {
  const user = await loadAuthUser(context.user!.id);

  return {
    serieProgress: user.serieProgress,
    experience: user.experience,
  };
});

const updateMe = os.updateMe.use(requireAuth).handler(async ({ input, context }) => {
  const user = await loadAuthUser(context.user!.id);

  if (input.serieProgress) {
    user.serieProgress = { ...user.serieProgress, ...input.serieProgress };
  }

  if (input.experience !== undefined) {
    user.experience = input.experience;
  }

  await user.save();

  return {
    serieProgress: user.serieProgress,
    experience: user.experience,
  };
});

const completeEpisode = os.completeEpisode
  .use(requireAuth)
  .handler(async ({ input, context }) => {
    const user = await loadAuthUser(context.user!.id);
    const episodeId = input.params.episodeId;

    if (user.completedEpisodes.includes(episodeId)) {
      return {
        serieProgress: user.serieProgress,
        experience: user.experience,
        newlyUnlocked: {
          characters: [],
          items: [],
          fruits: [],
          swords: [],
          boats: [],
        },
      };
    }

    const nextProgress = {
      saga: input.body.sagaId,
      arc: input.body.arcId,
      episode: episodeId,
    };

    if (isProgressGreater(user.serieProgress, nextProgress)) {
      user.serieProgress = nextProgress;
    }

    user.experience += input.body.experienceGain;
    user.completedEpisodes.push(episodeId);

    const { merged, newlyUnlocked } = mergeUnlockedCards(
      user.unlockedCards,
      input.body.cardsToUnlock,
    );
    user.unlockedCards = merged;

    await user.save();

    return {
      serieProgress: user.serieProgress,
      experience: user.experience,
      newlyUnlocked,
    };
  });

const resetMe = os.resetMe.use(requireAuth).handler(async ({ context }) => {
  const user = await loadAuthUser(context.user!.id);

  user.serieProgress = { saga: 0, arc: 0, episode: 0 };
  user.experience = 0;
  user.completedEpisodes = [];
  user.unlockedCards = {
    characters: [],
    items: [],
    fruits: [],
    swords: [],
    boats: [],
  };

  await user.save();

  return {
    serieProgress: user.serieProgress,
    experience: user.experience,
    unlockedCards: user.unlockedCards,
  };
});

export const progressRouter = os.router({
  getMe,
  updateMe,
  completeEpisode,
  resetMe,
});

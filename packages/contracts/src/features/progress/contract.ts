import { oc } from '@orpc/contract';
import {
  completeEpisodeInputSchema,
  completeEpisodeOutputSchema,
  progressMeSchema,
  resetProgressOutputSchema,
  updateProgressInputSchema,
} from './schemas.js';

export const progressErrors = {
  UNAUTHORIZED: {
    status: 401,
    message: 'Not authorized, no user found',
  },
} as const;

export const progressContract = oc
  .tag('Progress')
  .prefix('/progress')
  .router({
    getMe: oc
      .route({
        method: 'GET',
        path: '/me',
        description:
          'Get serie progress and experience for the authenticated user',
      })
      .errors(progressErrors)
      .output(progressMeSchema),

    updateMe: oc
      .route({
        method: 'PATCH',
        path: '/me',
        description: 'Update serie progress or experience manually',
      })
      .input(updateProgressInputSchema)
      .errors(progressErrors)
      .output(progressMeSchema),

    completeEpisode: oc
      .route({
        method: 'POST',
        path: '/me/episodes/{episodeId}/complete',
        inputStructure: 'detailed',
        description: 'Mark an episode as completed and unlock cards',
      })
      .input(completeEpisodeInputSchema)
      .errors(progressErrors)
      .output(completeEpisodeOutputSchema),

    resetMe: oc
      .route({
        method: 'DELETE',
        path: '/me',
        description: 'Reset serie progress, experience and unlocked cards',
      })
      .errors(progressErrors)
      .output(resetProgressOutputSchema),
  });

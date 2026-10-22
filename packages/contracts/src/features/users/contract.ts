import { oc } from '@orpc/contract';
import * as z from 'zod/v4';

import { postPageSchema } from '../../common/post.schemas.js';
import {
  sessionUserSchema,
  userIdParamsSchema,
  userSummarySchema,
} from '../../common/user.schemas.js';
import {
  deleteUserOutputSchema,
  followOutputSchema,
  updatePreferencesInputSchema,
  updateUserInputSchema,
  userByIdOutputSchema,
  userPostPageInputSchema,
  userRankingEntrySchema,
  userStatsSchema,
  verifyUserOutputSchema,
} from './schemas.js';

export const usersErrors = {
  USER_NOT_FOUND: {
    status: 404,
    message: 'User not found',
  },
  USERNAME_TAKEN: {
    status: 409,
    message: 'Username already taken',
  },
  PRIVACY_DENIED: {
    status: 403,
    message: 'Privacy settings prevent access',
  },
  CANNOT_FOLLOW_SELF: {
    status: 400,
    message: 'Cannot follow yourself',
  },
  ALREADY_FOLLOWING: {
    status: 400,
    message: 'Already following this user',
  },
  NOT_FOLLOWING: {
    status: 400,
    message: 'Not following this user',
  },
} as const;

export const usersContract = oc
  .tag('Users')
  .prefix('/users')
  .router({
    list: oc
      .route({
        method: 'GET',
        path: '/',
        description: 'List all users',
      })
      .errors(usersErrors)
      .output(z.array(userSummarySchema)),

    ranking: oc
      .route({
        method: 'GET',
        path: '/ranking',
        description: 'Top users by experience for profile sidebar',
      })
      .errors(usersErrors)
      .output(z.array(userRankingEntrySchema)),

    getStats: oc
      .route({
        method: 'GET',
        path: '/{id}/stats',
        inputStructure: 'detailed',
        description: 'Get activity stats for a user',
      })
      .input(userIdParamsSchema)
      .errors(usersErrors)
      .output(userStatsSchema),

    getFollowers: oc
      .route({
        method: 'GET',
        path: '/{id}/followers',
        inputStructure: 'detailed',
        description: 'List followers of a user',
      })
      .input(userIdParamsSchema)
      .errors(usersErrors)
      .output(z.array(userSummarySchema)),

    getFollowing: oc
      .route({
        method: 'GET',
        path: '/{id}/following',
        inputStructure: 'detailed',
        description: 'List users followed by a user',
      })
      .input(userIdParamsSchema)
      .errors(usersErrors)
      .output(z.array(userSummarySchema)),

    getPosts: oc
      .route({
        method: 'GET',
        path: '/{id}/posts',
        inputStructure: 'detailed',
        description: 'List public posts by a user',
      })
      .input(userPostPageInputSchema)
      .errors(usersErrors)
      .output(postPageSchema),

    getLikedPosts: oc
      .route({
        method: 'GET',
        path: '/{id}/liked-posts',
        inputStructure: 'detailed',
        description: 'List posts liked by a user',
      })
      .input(userPostPageInputSchema)
      .errors(usersErrors)
      .output(postPageSchema),

    getBookmarkedPosts: oc
      .route({
        method: 'GET',
        path: '/{id}/bookmarked-posts',
        inputStructure: 'detailed',
        description: 'List posts bookmarked by a user',
      })
      .input(userPostPageInputSchema)
      .errors(usersErrors)
      .output(postPageSchema),

    getCommentedPosts: oc
      .route({
        method: 'GET',
        path: '/{id}/commented-posts',
        inputStructure: 'detailed',
        description: 'List posts commented by a user',
      })
      .input(userPostPageInputSchema)
      .errors(usersErrors)
      .output(postPageSchema),

    updatePreferences: oc
      .route({
        method: 'PATCH',
        path: '/{id}/preferences',
        inputStructure: 'detailed',
        description:
          'Update own notification, timeline and accessibility preferences',
      })
      .input(updatePreferencesInputSchema)
      .errors(usersErrors)
      .output(sessionUserSchema),

    verify: oc
      .route({
        method: 'POST',
        path: '/{id}/verify',
        inputStructure: 'detailed',
        description: 'Verify own account after a simulated premium payment',
      })
      .input(userIdParamsSchema)
      .errors(usersErrors)
      .output(verifyUserOutputSchema),

    unverify: oc
      .route({
        method: 'POST',
        path: '/{id}/unverify',
        inputStructure: 'detailed',
        description: 'Cancel premium and drop the verified badge',
      })
      .input(userIdParamsSchema)
      .errors(usersErrors)
      .output(verifyUserOutputSchema),

    getById: oc
      .route({
        method: 'GET',
        path: '/{id}',
        inputStructure: 'detailed',
        description: 'Get a user by id',
      })
      .input(userIdParamsSchema)
      .errors(usersErrors)
      .output(userByIdOutputSchema),

    update: oc
      .route({
        method: 'PATCH',
        path: '/{id}',
        inputStructure: 'detailed',
        description: 'Update own user profile',
      })
      .input(updateUserInputSchema)
      .errors(usersErrors)
      .output(sessionUserSchema),

    delete: oc
      .route({
        method: 'DELETE',
        path: '/{id}',
        inputStructure: 'detailed',
        description: 'Delete own user account',
      })
      .input(userIdParamsSchema)
      .errors(usersErrors)
      .output(deleteUserOutputSchema),

    follow: oc
      .route({
        method: 'POST',
        path: '/{id}/follow',
        inputStructure: 'detailed',
        description: 'Follow a user',
      })
      .input(userIdParamsSchema)
      .errors(usersErrors)
      .output(followOutputSchema),

    unfollow: oc
      .route({
        method: 'POST',
        path: '/{id}/unfollow',
        inputStructure: 'detailed',
        description: 'Unfollow a user',
      })
      .input(userIdParamsSchema)
      .errors(usersErrors)
      .output(followOutputSchema),
  });

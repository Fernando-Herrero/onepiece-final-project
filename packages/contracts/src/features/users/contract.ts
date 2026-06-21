import { oc } from '@orpc/contract';
import { z } from 'zod';
import { postPublicSchema } from '../../common/post.schemas.js';
import {
  userIdParamsSchema,
  userPublicSchema,
  userSummarySchema,
} from '../../common/user.schemas.js';
import {
  deleteUserOutputSchema,
  followOutputSchema,
  updateUserInputSchema,
  userRankingEntrySchema,
  userStatsSchema,
} from './schemas.js';

export const usersErrors = {
  UNAUTHORIZED: {
    status: 401,
    message: 'Not authorized, no user found',
  },
  FORBIDDEN: {
    status: 403,
    message: 'Forbidden',
  },
  USER_NOT_FOUND: {
    status: 404,
    message: 'Usuario no encontrado',
  },
  PRIVACY_DENIED: {
    status: 403,
    message: 'Privacy settings prevent access',
  },
  CANNOT_FOLLOW_SELF: {
    status: 400,
    message: 'No puedes seguirte a ti mismo',
  },
  ALREADY_FOLLOWING: {
    status: 400,
    message: 'Ya sigues a este usuario',
  },
  NOT_FOLLOWING: {
    status: 400,
    message: 'No sigues a este usuario',
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
      .input(userIdParamsSchema)
      .errors(usersErrors)
      .output(z.array(postPublicSchema)),

    getLikedPosts: oc
      .route({
        method: 'GET',
        path: '/{id}/liked-posts',
        inputStructure: 'detailed',
        description: 'List posts liked by a user',
      })
      .input(userIdParamsSchema)
      .errors(usersErrors)
      .output(z.array(postPublicSchema)),

    getBookmarkedPosts: oc
      .route({
        method: 'GET',
        path: '/{id}/bookmarked-posts',
        inputStructure: 'detailed',
        description: 'List posts bookmarked by a user',
      })
      .input(userIdParamsSchema)
      .errors(usersErrors)
      .output(z.array(postPublicSchema)),

    getCommentedPosts: oc
      .route({
        method: 'GET',
        path: '/{id}/commented-posts',
        inputStructure: 'detailed',
        description: 'List posts commented by a user',
      })
      .input(userIdParamsSchema)
      .errors(usersErrors)
      .output(z.array(postPublicSchema)),

    getById: oc
      .route({
        method: 'GET',
        path: '/{id}',
        inputStructure: 'detailed',
        description: 'Get a user by id',
      })
      .input(userIdParamsSchema)
      .errors(usersErrors)
      .output(userPublicSchema),

    update: oc
      .route({
        method: 'PATCH',
        path: '/{id}',
        inputStructure: 'detailed',
        description: 'Update own user profile',
      })
      .input(updateUserInputSchema)
      .errors(usersErrors)
      .output(userPublicSchema),

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

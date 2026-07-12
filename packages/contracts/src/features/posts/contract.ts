import { oc } from '@orpc/contract';
import { z } from 'zod';
import {
  createPostSchema,
  postPublicSchema,
} from '../../common/post.schemas.js';
import {
  listPostsInputSchema,
  listPostsOutputSchema,
  postIdParamsSchema,
  shareTokenParamsSchema,
  toggleBookmarkOutputSchema,
  toggleLikeOutputSchema,
  toggleRetweetOutputSchema,
  updatePostInputSchema,
} from './schemas.js';

export const postsErrors = {
  UNAUTHORIZED: {
    status: 401,
    message: 'Not authorized, no user found',
  },
  FORBIDDEN: {
    status: 403,
    message: 'Forbidden',
  },
  POST_NOT_FOUND: {
    status: 404,
    message: 'Post no encontrado',
  },
} as const;

export const postsContract = oc
  .tag('Posts')
  .prefix('/posts')
  .router({
    list: oc
      .route({
        method: 'GET',
        path: '/',
        description: 'List public posts (cursor pagination)',
      })
      .input(listPostsInputSchema)
      .errors(postsErrors)
      .output(listPostsOutputSchema),

    getByShareToken: oc
      .route({
        method: 'GET',
        path: '/share/{shareToken}',
        inputStructure: 'detailed',
        description: 'Get a post by share token',
      })
      .input(shareTokenParamsSchema)
      .errors(postsErrors)
      .output(postPublicSchema),

    getById: oc
      .route({
        method: 'GET',
        path: '/{id}',
        inputStructure: 'detailed',
        description: 'Get a post by id',
      })
      .input(postIdParamsSchema)
      .errors(postsErrors)
      .output(postPublicSchema),

    create: oc
      .route({
        method: 'POST',
        path: '/',
        description: 'Create a new post',
      })
      .input(createPostSchema)
      .errors(postsErrors)
      .output(postPublicSchema),

    update: oc
      .route({
        method: 'PATCH',
        path: '/{id}',
        inputStructure: 'detailed',
        description: 'Update own post',
      })
      .input(updatePostInputSchema)
      .errors(postsErrors)
      .output(postPublicSchema),

    delete: oc
      .route({
        method: 'DELETE',
        path: '/{id}',
        inputStructure: 'detailed',
        description: 'Soft-delete own post',
      })
      .input(postIdParamsSchema)
      .errors(postsErrors)
      .output(postPublicSchema),

    toggleLike: oc
      .route({
        method: 'POST',
        path: '/{id}/like',
        inputStructure: 'detailed',
        description: 'Toggle like on a post',
      })
      .input(postIdParamsSchema)
      .errors(postsErrors)
      .output(toggleLikeOutputSchema),

    toggleBookmark: oc
      .route({
        method: 'POST',
        path: '/{id}/bookmark',
        inputStructure: 'detailed',
        description: 'Toggle bookmark on a post',
      })
      .input(postIdParamsSchema)
      .errors(postsErrors)
      .output(toggleBookmarkOutputSchema),

    toggleRetweet: oc
      .route({
        method: 'POST',
        path: '/{id}/retweet',
        inputStructure: 'detailed',
        description: 'Toggle retweet on a post',
      })
      .input(postIdParamsSchema)
      .errors(postsErrors)
      .output(toggleRetweetOutputSchema),
  });

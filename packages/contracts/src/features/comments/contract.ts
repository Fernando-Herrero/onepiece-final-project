import { oc } from '@orpc/contract';
import { z } from 'zod';
import {
  commentPublicSchema,
  createCommentSchema,
} from '../../common/comment.schemas.js';
import {
  commentIdParamsSchema,
  postIdInPathParamsSchema,
  toggleCommentLikeOutputSchema,
} from './schemas.js';

export const commentsErrors = {
  UNAUTHORIZED: {
    status: 401,
    message: 'Not authorized, no user found',
  },
  FORBIDDEN: {
    status: 403,
    message: 'Forbidden',
  },
  COMMENT_NOT_FOUND: {
    status: 404,
    message: 'Comment not found',
  },
  POST_NOT_FOUND: {
    status: 404,
    message: 'Post no encontrado',
  },
} as const;

export const commentsContract = oc
  .tag('Comments')
  .prefix('/comments')
  .router({
    listByPost: oc
      .route({
        method: 'GET',
        path: '/post/{postId}',
        inputStructure: 'detailed',
        description: 'List comments for a post',
      })
      .input(postIdInPathParamsSchema)
      .errors(commentsErrors)
      .output(z.array(commentPublicSchema)),

    create: oc
      .route({
        method: 'POST',
        path: '/',
        description: 'Create a comment on a post',
      })
      .input(createCommentSchema)
      .errors(commentsErrors)
      .output(commentPublicSchema),

    delete: oc
      .route({
        method: 'DELETE',
        path: '/{id}',
        inputStructure: 'detailed',
        description: 'Soft-delete own comment',
      })
      .input(commentIdParamsSchema)
      .errors(commentsErrors)
      .output(commentPublicSchema),

    toggleLike: oc
      .route({
        method: 'POST',
        path: '/{id}/like',
        inputStructure: 'detailed',
        description: 'Toggle like on a comment',
      })
      .input(commentIdParamsSchema)
      .errors(commentsErrors)
      .output(toggleCommentLikeOutputSchema),
  });

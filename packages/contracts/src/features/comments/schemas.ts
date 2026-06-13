import { z } from 'zod';
import { mongoIdSchema } from '../../common/user.schemas.js';

export const commentIdParamsSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
  }),
});

export const postIdInPathParamsSchema = z.object({
  params: z.object({
    postId: mongoIdSchema,
  }),
});

export const toggleCommentLikeOutputSchema = z.object({
  liked: z.boolean(),
  likesCount: z.number(),
  userLiked: z.boolean(),
});

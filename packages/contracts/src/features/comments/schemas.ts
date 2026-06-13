import { z } from 'zod';
import { mongoIdParamsSchema } from '../../common/user.schemas.js';

export const commentIdParamsSchema = mongoIdParamsSchema();

export const postIdInPathParamsSchema = mongoIdParamsSchema('postId');

export const toggleCommentLikeOutputSchema = z.object({
  liked: z.boolean(),
  likesCount: z.number(),
  userLiked: z.boolean(),
});

import { z } from 'zod';
import { updatePostSchema } from '../../common/post.schemas.js';
import { mongoIdParamsSchema } from '../../common/user.schemas.js';

export const postIdParamsSchema = mongoIdParamsSchema();

export const shareTokenParamsSchema = z.object({
  params: z.object({
    shareToken: z.uuid('Token de compartir no válido'),
  }),
});

export const updatePostInputSchema = postIdParamsSchema.extend({
  body: updatePostSchema,
});

export const toggleLikeOutputSchema = z.object({
  liked: z.boolean(),
  likesCount: z.number(),
  userLiked: z.boolean(),
});

export const toggleBookmarkOutputSchema = z.object({
  bookmarked: z.boolean(),
  bookmarksCount: z.number(),
  userBookmarked: z.boolean(),
});

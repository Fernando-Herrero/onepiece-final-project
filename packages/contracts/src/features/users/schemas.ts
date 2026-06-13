import { z } from 'zod';
import {
  updateUserSchema,
  userIdParamsSchema,
  userPublicSchema,
} from '../../common/user.schemas.js';

export const userStatsSchema = z.object({
  myPosts: z.number(),
  likedPosts: z.number(),
  bookmarkedPosts: z.number(),
  commentedPosts: z.number(),
  totalComments: z.number(),
});

export const deleteUserOutputSchema = z.object({
  ok: z.literal(true),
  removed: userPublicSchema,
});

export const updateUserInputSchema = userIdParamsSchema.extend({
  body: updateUserSchema,
});

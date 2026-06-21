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

export const userRankingEntrySchema = z.object({
  _id: z.string(),
  username: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  avatar: z.string().optional(),
  displayName: z.string().optional(),
  verified: z.boolean(),
  isActive: z.boolean(),
  experience: z.number(),
});

export const deleteUserOutputSchema = z.object({
  ok: z.literal(true),
  removed: userPublicSchema,
});

export const updateUserInputSchema = userIdParamsSchema.extend({
  body: updateUserSchema,
});

export const followOutputSchema = z.object({
  message: z.string(),
  following: z.boolean(),
  followersCount: z.number(),
  followingCount: z.number(),
});

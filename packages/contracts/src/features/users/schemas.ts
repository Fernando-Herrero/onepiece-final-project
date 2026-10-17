import * as z from 'zod/v4';

import {
  accessibilityPreferencesSchema,
  notificationPreferencesSchema,
  timelinePreferencesSchema,
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

/** Salida de verify/unverify: devuelve el usuario ya actualizado para refrescar la sesión. */
export const verifyUserOutputSchema = z.object({
  ok: z.literal(true),
  user: userPublicSchema,
});

/** Cada grupo es opcional: se hace merge parcial sobre las preferencias guardadas. */
export const updatePreferencesSchema = z
  .object({
    notifications: notificationPreferencesSchema.optional(),
    timeline: timelinePreferencesSchema.optional(),
    accessibility: accessibilityPreferencesSchema.optional(),
  })
  .strict()
  .refine(data => Object.keys(data).length > 0, {
    message: 'At least one preferences group is required',
  });

export const updatePreferencesInputSchema = userIdParamsSchema.extend({
  body: updatePreferencesSchema,
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

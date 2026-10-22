import * as z from 'zod/v4';

import { postPageQuerySchema } from '../../common/post.schemas.js';
import {
  accessibilityPreferencesSchema,
  notificationPreferencesSchema,
  sessionUserSchema,
  timelinePreferencesSchema,
  updateUserSchema,
  userIdParamsSchema,
  userProfileSchema,
} from '../../common/user.schemas.js';

/** Un contador cuya pestaña oculta `privacy` al viewer no viene. */
export const userStatsSchema = z.object({
  myPosts: z.number().optional(),
  likedPosts: z.number().optional(),
  bookmarkedPosts: z.number().optional(),
  commentedPosts: z.number().optional(),
  totalComments: z.number().optional(),
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

/** `full` para uno mismo y el admin, `public` para el resto (ADR 0006). */
export const userByIdOutputSchema = z.discriminatedUnion('access', [
  sessionUserSchema.extend({ access: z.literal('full') }),
  userProfileSchema.extend({ access: z.literal('public') }),
]);

export const deleteUserOutputSchema = z.object({
  ok: z.literal(true),
  removed: sessionUserSchema,
});

/** Salida de verify/unverify: devuelve el usuario ya actualizado para refrescar la sesión. */
export const verifyUserOutputSchema = z.object({
  ok: z.literal(true),
  user: sessionUserSchema,
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

export const userPostPageInputSchema = userIdParamsSchema.extend({
  query: postPageQuerySchema,
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

import * as z from 'zod/v4';

import {
  avatarPathSchema,
  registerAvatarPathSchema,
} from './avatar.schemas.js';
import { mongoIdParamsSchema } from './id.schemas.js';

export const userRoleSchema = z.enum(['user', 'admin']);

export const privacySchema = z.object({
  showPosts: z.boolean(),
  showLikes: z.boolean(),
  showBookmarked: z.boolean(),
  showComments: z.boolean(),
});

export const notificationPreferencesSchema = z.object({
  likes: z.boolean(),
  comments: z.boolean(),
  follows: z.boolean(),
  bookmarks: z.boolean(),
  retweets: z.boolean(),
});

export const timelinePreferencesSchema = z.object({
  showRetweets: z.boolean(),
  compactMode: z.boolean(),
  blurMedia: z.boolean(),
});

export const fontScaleSchema = z.enum(['sm', 'md', 'lg']);

export const accessibilityPreferencesSchema = z.object({
  reduceMotion: z.boolean(),
  fontScale: fontScaleSchema,
  highContrast: z.boolean(),
});

export const userPreferencesSchema = z.object({
  notifications: notificationPreferencesSchema,
  timeline: timelinePreferencesSchema,
  accessibility: accessibilityPreferencesSchema,
});

/** Valores por defecto: se aplican al registrar y al serializar usuarios antiguos. */
export const DEFAULT_USER_PREFERENCES: z.infer<typeof userPreferencesSchema> = {
  notifications: {
    likes: true,
    comments: true,
    follows: true,
    bookmarks: true,
    retweets: true,
  },
  timeline: {
    showRetweets: true,
    compactMode: false,
    blurMedia: false,
  },
  accessibility: {
    reduceMotion: false,
    fontScale: 'md',
    highContrast: false,
  },
};

export const DEFAULT_PRIVACY: z.infer<typeof privacySchema> = {
  showPosts: true,
  showLikes: true,
  showBookmarked: true,
  showComments: true,
};

export const serieProgressSchema = z.object({
  saga: z.number(),
  arc: z.number(),
  episode: z.number(),
});

export const unlockedCardsSchema = z.object({
  characters: z.array(z.number()),
  items: z.array(z.number()),
  fruits: z.array(z.number()),
  swords: z.array(z.number()),
  boats: z.array(z.number()),
});

const profileFieldsSchema = z.object({
  username: z.string().trim().min(3),
  firstName: z.string().trim().min(2),
  lastName: z.string().trim().min(2),
  displayName: z.string().trim().optional(),
  bio: z.string().max(2000).optional(),
  avatar: avatarPathSchema.optional(),
  coverImage: z.string().optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  privacy: privacySchema.optional(),
});

export const createUserSchema = profileFieldsSchema
  .extend({
    email: z.email(),
    password: z.string().min(6),
    avatar: z.string().min(1).pipe(registerAvatarPathSchema),
  })
  .strict();

export const updateUserSchema = profileFieldsSchema
  .partial()
  .strict()
  .refine(data => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export const userIdParamsSchema = mongoIdParamsSchema();

export const userSummarySchema = z.object({
  _id: z.string(),
  username: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  avatar: z.string().optional(),
  displayName: z.string().optional(),
  verified: z.boolean(),
  bio: z.string().optional(),
  role: userRoleSchema,
  isActive: z.boolean(),
});

/** Lo que ve cualquiera de un perfil (ADR 0006). */
export const userProfileSchema = z.object({
  _id: z.string(),
  username: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  displayName: z.string().optional(),
  bio: z.string().optional(),
  avatar: z.string().optional(),
  coverImage: z.string().optional(),
  role: userRoleSchema,
  verified: z.boolean(),
  isActive: z.boolean(),
  experience: z.number(),
  serieProgress: serieProgressSchema,
  unlockedCards: unlockedCardsSchema,
  privacy: privacySchema,
  followers: z.array(z.string()),
  following: z.array(z.string()),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  fullName: z.string().optional(),
});

/** Perfil más datos privados: solo para uno mismo y el admin. */
export const sessionUserSchema = userProfileSchema.extend({
  email: z.string(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  preferences: userPreferencesSchema,
});

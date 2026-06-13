import { z } from 'zod';

export const userRoleSchema = z.enum(['user', 'admin']);

export const privacySchema = z.object({
  showPosts: z.boolean(),
  showLikes: z.boolean(),
  showBookmarked: z.boolean(),
  showComments: z.boolean(),
});

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
  username: z
    .string()
    .trim()
    .min(3, 'El username debe tener al menos 3 caracteres'),
  firstName: z
    .string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z
    .string()
    .trim()
    .min(2, 'El apellido debe tener al menos 2 caracteres'),
  displayName: z.string().trim().optional(),
  bio: z
    .string()
    .max(2000, 'La bio no puede superar 2000 caracteres')
    .optional(),
  avatar: z.string().optional(),
  coverImage: z.string().optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  privacy: privacySchema.optional(),
});

export const createUserSchema = profileFieldsSchema
  .extend({
    email: z.email('Email no válido'),
    password: z
      .string()
      .min(6, 'La contraseña debe tener al menos 6 caracteres'),
  })
  .strict();

export const updateUserSchema = profileFieldsSchema
  .partial()
  .strict()
  .refine(data => Object.keys(data).length > 0, {
    message: 'Debes enviar al menos un campo para actualizar',
  });

export const mongoIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'ID de usuario no válido');

export const userIdParamsSchema = z.object({
  params: z.object({
    id: mongoIdSchema,
  }),
});

export const userSummarySchema = z.object({
  _id: z.string(),
  username: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  avatar: z.string().optional(),
  displayName: z.string().optional(),
  verified: z.boolean(),
  bio: z.string().optional(),
  privacy: privacySchema,
  role: userRoleSchema,
  isActive: z.boolean(),
});

export const userPublicSchema = z.object({
  _id: z.string(),
  username: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  displayName: z.string().optional(),
  bio: z.string().optional(),
  phoneNumber: z.string().optional(),
  avatar: z.string().optional(),
  coverImage: z.string().optional(),
  address: z.string().optional(),
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

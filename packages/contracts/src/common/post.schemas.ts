import { z } from 'zod';

export const postVisibilitySchema = z.enum(['public', 'private', 'followers']);

export const postAuthorSchema = z.object({
  _id: z.string(),
  username: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  avatar: z.string().optional(),
  displayName: z.string().optional(),
  verified: z.boolean(),
});

const postFieldsSchema = z.object({
  text: z.string().trim().min(1, 'El texto es obligatorio'),
  images: z.array(z.string()).optional(),
  visibility: postVisibilitySchema.optional(),
  isPinned: z.boolean().optional(),
});

export const createPostSchema = postFieldsSchema.strict();

export const updatePostSchema = postFieldsSchema
  .partial()
  .strict()
  .refine(data => Object.keys(data).length > 0, {
    message: 'Debes enviar al menos un campo para actualizar',
  });

export const postPublicSchema = z.object({
  _id: z.string(),
  text: z.string(),
  userId: postAuthorSchema,
  images: z.array(z.string()).optional(),
  visibility: postVisibilitySchema,
  isDeleted: z.boolean(),
  shareToken: z.string().optional(),
  isRetweet: z.boolean(),
  isReply: z.boolean(),
  isPinned: z.boolean(),
  language: z.string(),
  likes: z.array(z.string()),
  bookmarks: z.array(z.string()),
  likesCount: z.number(),
  bookmarksCount: z.number(),
  commentsCount: z.number(),
  retweetsCount: z.number(),
  hashtags: z.array(z.string()),
  mentions: z.array(z.string()),
  retweets: z.array(z.string()),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  userLiked: z.boolean().optional(),
  userBookmarked: z.boolean().optional(),
});

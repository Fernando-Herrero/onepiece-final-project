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

export const POST_TEXT_MAX_LENGTH = 280;
export const POST_TEXT_MAX_LENGTH_VERIFIED = 600;
export const POST_FEED_PAGE_SIZE = 20;
export const POST_MAX_IMAGES = 4;
export const POST_IMAGE_MAX_BYTES = 10 * 1024 * 1024;

const postFieldsSchema = z.object({
  text: z.string().trim().min(1, 'El texto es obligatorio'),
  images: z
    .array(z.string().url('URL de imagen no válida'))
    .max(POST_MAX_IMAGES, `Máximo ${POST_MAX_IMAGES} imágenes`)
    .optional(),
  visibility: postVisibilitySchema.optional(),
  isPinned: z.boolean().optional(),
});

export const createPostSchema = postFieldsSchema.strict();

/** Límite de caracteres del texto según si el autor está verificado (legacy v2). */
export function getPostTextMaxLength(verified: boolean) {
  return verified ? POST_TEXT_MAX_LENGTH_VERIFIED : POST_TEXT_MAX_LENGTH;
}

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
  retweetOf: z.string().optional(),
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
  userRetweeted: z.boolean().optional(),
  /** Autor del post original cuando `isRetweet` es true (UX estilo Twitter). */
  originalAuthor: postAuthorSchema.optional(),
});

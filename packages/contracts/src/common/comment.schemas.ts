import { z } from 'zod';
import { postAuthorSchema } from './post.schemas.js';
import { mongoIdSchema } from './id.schemas.js';

export const createCommentSchema = z
  .object({
    postId: mongoIdSchema,
    text: z.string().trim().min(1, 'El texto es obligatorio'),
    images: z.array(z.string()).optional(),
    parentComment: mongoIdSchema.optional(),
  })
  .strict();

export const commentPublicSchema = z.object({
  _id: z.string(),
  postId: z.string(),
  userId: postAuthorSchema,
  text: z.string(),
  images: z.array(z.string()),
  likes: z.array(z.string()),
  likesCount: z.number(),
  repliesCount: z.number(),
  isReply: z.boolean(),
  hashtags: z.array(z.string()),
  mentions: z.array(z.string()),
  isDeleted: z.boolean(),
  source: z.string(),
  language: z.string(),
  parentComment: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  userLiked: z.boolean().optional(),
  liked: z.boolean().optional(),
});

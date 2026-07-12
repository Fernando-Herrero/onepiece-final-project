import { z } from 'zod';
import { mongoIdParamsSchema } from '../../common/id.schemas.js';
import {
  POST_FEED_PAGE_SIZE,
  postPublicSchema,
  updatePostSchema,
} from '../../common/post.schemas.js';

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

export const toggleRetweetOutputSchema = z.object({
  retweeted: z.boolean(),
  retweetsCount: z.number(),
  userRetweeted: z.boolean(),
  /** Post-retweet creado; presente cuando `retweeted` es true. */
  retweetPost: postPublicSchema.optional(),
  /** Id del post-retweet eliminado al deshacer; presente cuando `retweeted` es false. */
  removedRetweetPostId: z.string().optional(),
});

export const listPostsInputSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional(),
  cursor: z.string().optional(),
});

export const listPostsOutputSchema = z.object({
  posts: z.array(postPublicSchema),
  nextCursor: z.string().nullable(),
});

export { POST_FEED_PAGE_SIZE };

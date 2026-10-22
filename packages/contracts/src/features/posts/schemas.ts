import * as z from 'zod/v4';

import { mongoIdParamsSchema } from '../../common/id.schemas.js';
import {
  postPublicSchema,
  updatePostSchema,
} from '../../common/post.schemas.js';

export const postIdParamsSchema = mongoIdParamsSchema();

export const shareTokenParamsSchema = z.object({
  params: z.object({
    shareToken: z.uuid(),
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

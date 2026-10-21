import { randomUUID } from 'node:crypto';

import type { createPostSchema } from '@logpose/contracts/common/post.schemas';
import { POST_FEED_PAGE_SIZE } from '@logpose/contracts/common/post.schemas';
import type { listPostsInputSchema } from '@logpose/contracts/features/posts/schemas';
import { Injectable } from '@nestjs/common';
import { ORPCError } from '@orpc/server';
import { type Filter, ObjectId, type WithId } from 'mongodb';
import type * as z from 'zod/v4';

import {
  accessTo,
  type UserViewer,
  type Viewer,
  visiblePostsFilter,
} from '../auth/access.js';
import { NotificationsPersistence } from '../notifications/notifications.persistence.js';
import { UsersPersistence } from '../users/users.persistence.js';
import {
  assertTextLength,
  collectRetweetCheckIds,
  encodePostCursor,
  type PostDocument,
  serializePost,
  serializePostsWithAuthors,
} from './posts.mappers.js';
import { PostsPersistence } from './posts.persistence.js';

type CreatePostBody = z.infer<typeof createPostSchema>;
type ListPostsInput = z.infer<typeof listPostsInputSchema>;

@Injectable()
export class PostsService {
  constructor(
    private readonly postsPersistence: PostsPersistence,
    private readonly usersPersistence: UsersPersistence,
    private readonly notificationsPersistence: NotificationsPersistence,
  ) {}

  async list(input: ListPostsInput, viewer: Viewer) {
    const limit = input.limit ?? POST_FEED_PAGE_SIZE;
    const visible = await visiblePostsFilter(viewer, this.usersPersistence);
    const rows = await this.postsPersistence.findFeedPage(
      visible,
      limit,
      input.cursor,
    );
    const hasMore = rows.length > limit;
    const page = hasMore ? rows.slice(0, limit) : rows;
    const originalPostsById = await this.loadOriginalPostsMap(page, visible);
    const retweetedOriginalIds =
      viewer.kind === 'user'
        ? await this.postsPersistence.findRetweetedOriginalIds(
            viewer.id,
            collectRetweetCheckIds(page),
          )
        : undefined;
    const posts = await serializePostsWithAuthors(
      page,
      this.usersPersistence,
      viewer,
      retweetedOriginalIds,
      originalPostsById,
    );
    const lastRow = page.at(-1);

    return {
      posts,
      nextCursor: hasMore && lastRow ? encodePostCursor(lastRow) : null,
    };
  }

  async create(viewer: UserViewer, body: CreatePostBody) {
    const user = await this.usersPersistence.findById(viewer.id);

    if (!user) {
      throw new ORPCError('UNAUTHORIZED');
    }

    const textError = assertTextLength(body.text, user.verified);
    if (textError) {
      throw new ORPCError('FORBIDDEN');
    }

    const post = await this.postsPersistence.insert({
      text: body.text.trim(),
      userId: new ObjectId(viewer.id),
      images: body.images,
      visibility: body.visibility ?? 'public',
      shareToken: randomUUID(),
      language: 'es',
    });

    return serializePost(post, user, viewer);
  }

  async toggleLike(postId: string, viewer: UserViewer) {
    const result = await this.postsPersistence.toggleUserField(
      postId,
      viewer.id,
      'likes',
      await visiblePostsFilter(viewer, this.usersPersistence),
    );

    if (!result) {
      throw new ORPCError('POST_NOT_FOUND');
    }

    const liked = !result.alreadyHad;
    const ownerId = result.post.userId.toString();

    if (liked && ownerId !== viewer.id) {
      await this.notificationsPersistence.createLike(
        ownerId,
        viewer.id,
        postId,
      );
    }

    return {
      liked,
      likesCount: Math.max(0, result.post.likesCount),
      userLiked: liked,
    };
  }

  async toggleBookmark(postId: string, viewer: UserViewer) {
    const result = await this.postsPersistence.toggleUserField(
      postId,
      viewer.id,
      'bookmarks',
      await visiblePostsFilter(viewer, this.usersPersistence),
    );

    if (!result) {
      throw new ORPCError('POST_NOT_FOUND');
    }

    const bookmarked = !result.alreadyHad;
    const ownerId = result.post.userId.toString();

    if (bookmarked && ownerId !== viewer.id) {
      await this.notificationsPersistence.createBookmark(
        ownerId,
        viewer.id,
        postId,
      );
    }

    return {
      bookmarked,
      bookmarksCount: Math.max(0, result.post.bookmarksCount),
      userBookmarked: bookmarked,
    };
  }

  async toggleRetweet(postId: string, viewer: UserViewer) {
    const original = await this.postsPersistence.findVisibleById(
      postId,
      await visiblePostsFilter(viewer, this.usersPersistence),
    );

    if (!original) {
      throw new ORPCError('POST_NOT_FOUND');
    }

    // El retweet es un post público con el texto del original: solo de lo público.
    if (original.isRetweet || original.visibility !== 'public') {
      throw new ORPCError('FORBIDDEN');
    }

    const result = await this.postsPersistence.toggleRetweet(postId, viewer.id);

    if (!result) {
      throw new ORPCError('POST_NOT_FOUND');
    }

    if (result.retweeted) {
      const originalPostsById = new Map([
        [result.original._id.toString(), result.original],
      ]);
      const [retweetPost] = await serializePostsWithAuthors(
        [result.retweetPost],
        this.usersPersistence,
        viewer,
        new Set([postId]),
        originalPostsById,
      );

      return {
        retweeted: true,
        retweetsCount: Math.max(0, result.original.retweetsCount),
        userRetweeted: true,
        retweetPost,
      };
    }

    return {
      retweeted: false,
      retweetsCount: Math.max(0, result.original.retweetsCount),
      userRetweeted: false,
      removedRetweetPostId: result.removedRetweetPostId,
    };
  }

  private async loadOriginalPostsMap(
    posts: WithId<PostDocument>[],
    visible: Filter<PostDocument>,
  ) {
    const originalIds = [
      ...new Set(
        posts
          .filter(post => post.isRetweet && post.retweetOf)
          .map(post => post.retweetOf!.toString()),
      ),
    ];

    if (originalIds.length === 0) {
      return new Map();
    }

    const originals = await this.postsPersistence.findByIds(
      originalIds.map(id => new ObjectId(id)),
      visible,
    );

    return new Map(originals.map(post => [post._id.toString(), post]));
  }

  async delete(postId: string, viewer: UserViewer) {
    const post = await this.postsPersistence.findVisibleById(
      postId,
      await visiblePostsFilter(viewer, this.usersPersistence),
    );

    if (!post) {
      throw new ORPCError('POST_NOT_FOUND');
    }

    if (accessTo(viewer, post.userId.toString()) !== 'full') {
      throw new ORPCError('FORBIDDEN');
    }

    const deleted = await this.postsPersistence.softDeleteById(postId);

    if (!deleted) {
      throw new ORPCError('POST_NOT_FOUND');
    }

    const [serialized] = await serializePostsWithAuthors(
      [deleted],
      this.usersPersistence,
      viewer,
    );

    // Sin `originalPostsById` no se descarta ningún post: siempre hay uno.
    return serialized!;
  }
}

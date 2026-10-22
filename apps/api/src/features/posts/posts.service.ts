import { randomUUID } from 'node:crypto';

import type {
  createPostSchema,
  PostPageQuery,
} from '@logpose/contracts/common/post.schemas';
import { Injectable } from '@nestjs/common';
import { ORPCError } from '@orpc/server';
import { ObjectId } from 'mongodb';
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
  serializePost,
  serializePostsForViewer,
} from './posts.mappers.js';
import { PostsPersistence } from './posts.persistence.js';

type CreatePostBody = z.infer<typeof createPostSchema>;

@Injectable()
export class PostsService {
  constructor(
    private readonly postsPersistence: PostsPersistence,
    private readonly usersPersistence: UsersPersistence,
    private readonly notificationsPersistence: NotificationsPersistence,
  ) {}

  async list(query: PostPageQuery, viewer: Viewer) {
    const visible = await visiblePostsFilter(viewer, this.usersPersistence);
    const page = await this.postsPersistence.findPage({}, visible, query);

    return {
      ...page,
      posts: await serializePostsForViewer(page.posts, viewer, visible, {
        posts: this.postsPersistence,
        users: this.usersPersistence,
      }),
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
    const { active, post } = await this.toggleField(postId, viewer, 'likes');

    return {
      liked: active,
      likesCount: Math.max(0, post.likesCount),
      userLiked: active,
    };
  }

  async toggleBookmark(postId: string, viewer: UserViewer) {
    const { active, post } = await this.toggleField(
      postId,
      viewer,
      'bookmarks',
    );

    return {
      bookmarked: active,
      bookmarksCount: Math.max(0, post.bookmarksCount),
      userBookmarked: active,
    };
  }

  /** Like y guardado: el mismo toggle atómico y la misma notificación al añadir. */
  private async toggleField(
    postId: string,
    viewer: UserViewer,
    field: 'likes' | 'bookmarks',
  ) {
    const result = await this.postsPersistence.toggleUserField(
      postId,
      viewer.id,
      field,
      await visiblePostsFilter(viewer, this.usersPersistence),
    );

    if (!result) {
      throw new ORPCError('POST_NOT_FOUND');
    }

    const active = !result.alreadyHad;

    if (active) {
      await this.notificationsPersistence.create({
        type: field === 'likes' ? 'like' : 'bookmark',
        to: result.post.userId.toString(),
        from: viewer.id,
        postId,
      });
    }

    return { active, post: result.post };
  }

  async toggleRetweet(postId: string, viewer: UserViewer) {
    const visible = await visiblePostsFilter(viewer, this.usersPersistence);
    const original = await this.postsPersistence.findVisibleById(
      postId,
      visible,
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
      const [retweetPost] = await serializePostsForViewer(
        [result.retweetPost],
        viewer,
        visible,
        { posts: this.postsPersistence, users: this.usersPersistence },
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

  async delete(postId: string, viewer: UserViewer) {
    const visible = await visiblePostsFilter(viewer, this.usersPersistence);
    const post = await this.postsPersistence.findVisibleById(postId, visible);

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

    const [serialized] = await serializePostsForViewer(
      [deleted],
      viewer,
      visible,
      { posts: this.postsPersistence, users: this.usersPersistence },
    );

    // Un retweet solo envuelve un original público y vivo (`toggleRetweet` y la
    // cascada de `softDeleteById`), así que nunca se descarta.
    return serialized!;
  }
}

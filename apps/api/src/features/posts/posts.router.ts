import { randomUUID } from 'node:crypto';

import { contract } from '@logpose/contracts/contract';
import { implement, ORPCError } from '@orpc/server';
import mongoose, { type Types } from 'mongoose';

import {
  type ApiContext,
  assertOwnerOrAdmin,
  optionalAuth,
  requireAuth,
} from '../../integrations/orpc/auth.middleware.js';
import { createNotification } from '../notifications/notification.model.js';
import { User, type UserDoc } from '../users/user.model.js';
import {
  assertTextLength,
  Post,
  POST_AUTHOR_POPULATE,
  PUBLIC_POST_FILTER,
  serializePost,
  togglePostField,
} from './post.model.js';

const os = implement(contract.posts).$context<ApiContext>();

async function loadPost(id: string) {
  const post = await Post.findOne({ _id: id, isDeleted: false }).populate(
    POST_AUTHOR_POPULATE,
  );

  if (!post) {
    throw new ORPCError('POST_NOT_FOUND');
  }

  return post;
}

function getPostOwnerId(userId: Types.ObjectId | UserDoc) {
  return 'username' in userId ? userId._id.toString() : userId.toString();
}

const list = os.list.use(optionalAuth).handler(async ({ context }) => {
  const posts = await Post.find(PUBLIC_POST_FILTER)
    .sort({ createdAt: -1 })
    .populate(POST_AUTHOR_POPULATE);

  return posts.map(post => serializePost(post, context.user?.id));
});

const getById = os.getById
  .use(optionalAuth)
  .handler(async ({ input, context }) => {
    const post = await loadPost(input.params.id);
    return serializePost(post, context.user?.id);
  });

const getByShareToken = os.getByShareToken
  .use(optionalAuth)
  .handler(async ({ input, context }) => {
    const post = await Post.findOne({
      shareToken: input.params.shareToken,
      isDeleted: false,
    }).populate(POST_AUTHOR_POPULATE);

    if (!post) {
      throw new ORPCError('POST_NOT_FOUND');
    }

    return serializePost(post, context.user?.id);
  });

const create = os.create
  .use(requireAuth)
  .handler(async ({ input, context }) => {
    const author = await User.findById(context.user!.id);

    if (!author) {
      throw new ORPCError('UNAUTHORIZED');
    }

    const textError = assertTextLength(input.text, author.verified);
    if (textError) {
      throw new ORPCError('BAD_REQUEST', { message: textError });
    }

    const newPost = await Post.create({
      text: input.text,
      userId: context.user!.id,
      images: input.images,
      visibility: input.visibility,
      shareToken: randomUUID(),
    });

    await newPost.populate(POST_AUTHOR_POPULATE);
    return serializePost(newPost, context.user!.id);
  });

const update = os.update
  .use(requireAuth)
  .handler(async ({ input, context }) => {
    const post = await loadPost(input.params.id);
    assertOwnerOrAdmin(getPostOwnerId(post.userId), context.user!);

    if (input.body.text) {
      const author = await User.findById(post.userId);
      const textError = assertTextLength(
        input.body.text,
        author?.verified ?? false,
      );
      if (textError) {
        throw new ORPCError('BAD_REQUEST', { message: textError });
      }
    }

    const updated = await Post.findOneAndUpdate(
      { _id: input.params.id, isDeleted: false },
      input.body,
      { new: true, runValidators: true },
    ).populate(POST_AUTHOR_POPULATE);

    if (!updated) {
      throw new ORPCError('POST_NOT_FOUND');
    }

    return serializePost(updated, context.user!.id);
  });

const deletePost = os.delete
  .use(requireAuth)
  .handler(async ({ input, context }) => {
    const post = await loadPost(input.params.id);
    assertOwnerOrAdmin(getPostOwnerId(post.userId), context.user!);

    const updated = await Post.findOneAndUpdate(
      { _id: input.params.id, isDeleted: false },
      { isDeleted: true },
      { new: true },
    ).populate(POST_AUTHOR_POPULATE);

    if (!updated) {
      throw new ORPCError('POST_NOT_FOUND');
    }

    return serializePost(updated, context.user!.id);
  });

const toggleLike = os.toggleLike
  .use(requireAuth)
  .handler(async ({ input, context }) => {
    const post = await loadPost(input.params.id);

    const userObjectId = new mongoose.Types.ObjectId(context.user!.id);
    const result = await togglePostField(
      input.params.id,
      userObjectId,
      'likes',
    );

    if (!result?.updated) {
      throw new ORPCError('POST_NOT_FOUND');
    }

    const added = !result.alreadyHad;

    if (added) {
      const ownerId = getPostOwnerId(post.userId);
      await createNotification({
        type: 'like',
        to: ownerId,
        from: context.user!.id,
        postId: input.params.id,
      });
    }

    return {
      liked: added,
      likesCount: Math.max(0, result.updated.likesCount),
      userLiked: added,
    };
  });

const toggleBookmark = os.toggleBookmark
  .use(requireAuth)
  .handler(async ({ input, context }) => {
    const post = await loadPost(input.params.id);

    const userObjectId = new mongoose.Types.ObjectId(context.user!.id);
    const result = await togglePostField(
      input.params.id,
      userObjectId,
      'bookmarks',
    );

    if (!result?.updated) {
      throw new ORPCError('POST_NOT_FOUND');
    }

    const added = !result.alreadyHad;

    if (added) {
      const ownerId = getPostOwnerId(post.userId);
      await createNotification({
        type: 'bookmark',
        to: ownerId,
        from: context.user!.id,
        postId: input.params.id,
      });
    }

    return {
      bookmarked: added,
      bookmarksCount: Math.max(0, result.updated.bookmarksCount),
      userBookmarked: added,
    };
  });

export const postsRouter = os.router({
  list,
  getByShareToken,
  getById,
  create,
  update,
  delete: deletePost,
  toggleLike,
  toggleBookmark,
});

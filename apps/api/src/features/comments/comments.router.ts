import { contract } from '@logpose/contracts/contract';
import { implement, ORPCError } from '@orpc/server';
import mongoose from 'mongoose';

import {
  type ApiContext,
  assertOwnerOrAdmin,
  optionalAuth,
  requireAuth,
} from '../../integrations/orpc/auth.middleware.js';
import { createNotification } from '../notifications/notification.model.js';
import { findActivePostById, Post } from '../posts/post.model.js';
import { User } from '../users/user.model.js';
import {
  ACTIVE_COMMENT_FILTER,
  Comment,
  COMMENT_AUTHOR_POPULATE,
  findActiveCommentById,
  serializeComment,
  syncPostCommentsCount,
} from './comment.model.js';

const os = implement(contract.comments).$context<ApiContext>();

const listByPost = os.listByPost
  .use(optionalAuth)
  .handler(async ({ input, context }) => {
    const post = await findActivePostById(input.params.postId);

    if (!post) {
      throw new ORPCError('POST_NOT_FOUND');
    }

    const comments = await Comment.find({
      postId: input.params.postId,
      ...ACTIVE_COMMENT_FILTER,
    })
      .sort({ createdAt: 1 })
      .populate(COMMENT_AUTHOR_POPULATE);

    return comments.map(comment => serializeComment(comment, context.user?.id));
  });

const create = os.create
  .use(requireAuth)
  .handler(async ({ input, context }) => {
    const post = await findActivePostById(input.postId);

    if (!post) {
      throw new ORPCError('POST_NOT_FOUND');
    }

    const author = await User.findById(context.user!.id);

    if (!author) {
      throw new ORPCError('UNAUTHORIZED');
    }

    if (input.parentComment) {
      const parent = await findActiveCommentById(input.parentComment);

      if (!parent) {
        throw new ORPCError('COMMENT_NOT_FOUND', {
          message: 'Comentario padre no encontrado',
        });
      }

      if (parent.postId.toString() !== input.postId) {
        throw new ORPCError('BAD_REQUEST', {
          message: 'El comentario padre no pertenece a este post',
        });
      }
    }

    const newComment = await Comment.create({
      postId: input.postId,
      author: context.user!.id,
      text: input.text,
      images: input.images,
      parentComment: input.parentComment,
      isReply: Boolean(input.parentComment),
    });

    await Post.findByIdAndUpdate(input.postId, { $inc: { commentsCount: 1 } });

    if (input.parentComment) {
      await Comment.findByIdAndUpdate(input.parentComment, {
        $inc: { repliesCount: 1 },
      });
    }

    const populated = await Comment.findById(newComment._id).populate(
      COMMENT_AUTHOR_POPULATE,
    );

    if (!populated) {
      throw new ORPCError('COMMENT_NOT_FOUND');
    }

    const postOwnerId = post.userId.toString();
    await createNotification({
      type: 'comment',
      to: postOwnerId,
      from: context.user!.id,
      postId: input.postId,
      commentId: populated._id.toString(),
    });

    return serializeComment(populated, context.user!.id);
  });

const deleteComment = os.delete
  .use(requireAuth)
  .handler(async ({ input, context }) => {
    const comment = await findActiveCommentById(input.params.id);

    if (!comment) {
      throw new ORPCError('COMMENT_NOT_FOUND');
    }

    assertOwnerOrAdmin(comment.author.toString(), context.user!);

    const id = comment._id.toString();
    const postId = comment.postId.toString();

    await Comment.updateMany(
      { $or: [{ _id: id }, { parentComment: id }] },
      { isDeleted: true },
    );

    await syncPostCommentsCount(postId);

    if (comment.parentComment) {
      await Comment.findByIdAndUpdate(comment.parentComment, {
        $inc: { repliesCount: -1 },
      });
    }

    await comment.populate(COMMENT_AUTHOR_POPULATE);
    return serializeComment(comment, context.user!.id);
  });

const toggleLike = os.toggleLike
  .use(requireAuth)
  .handler(async ({ input, context }) => {
    const comment = await findActiveCommentById(input.params.id);

    if (!comment) {
      throw new ORPCError('COMMENT_NOT_FOUND');
    }

    const id = comment._id.toString();
    const userObjectId = new mongoose.Types.ObjectId(context.user!.id);
    const alreadyLiked = comment.likes.some(likeId =>
      likeId.equals(userObjectId),
    );

    const updated = await Comment.findByIdAndUpdate(
      id,
      alreadyLiked
        ? { $pull: { likes: userObjectId }, $inc: { likesCount: -1 } }
        : { $addToSet: { likes: userObjectId }, $inc: { likesCount: 1 } },
      { new: true },
    );

    if (!updated) {
      throw new ORPCError('COMMENT_NOT_FOUND');
    }

    if (updated.likesCount < 0) {
      updated.likesCount = updated.likes.length;
      await updated.save();
    }

    const liked = !alreadyLiked;

    if (liked) {
      await createNotification({
        type: 'like',
        to: comment.author.toString(),
        from: context.user!.id,
        postId: comment.postId.toString(),
        commentId: id,
      });
    }

    return {
      liked,
      likesCount: Math.max(0, updated.likesCount),
      userLiked: liked,
    };
  });

export const commentsRouter = os.router({
  listByPost,
  create,
  delete: deleteComment,
  toggleLike,
});

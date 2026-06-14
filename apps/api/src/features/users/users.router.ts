import { contract } from '@logpose/contracts/contract';
import { implement, ORPCError } from '@orpc/server';
import mongoose from 'mongoose';

import {
  type ApiContext,
  assertOwnerOrAdmin,
  type AuthPayload,
  optionalAuth,
  requireAdmin,
  requireAuth,
} from '../../integrations/orpc/auth.middleware.js';
import { Comment } from '../comments/comment.model.js';
import { createNotification } from '../notifications/notification.model.js';
import {
  Post,
  POST_AUTHOR_SELECT,
  serializePost,
} from '../posts/post.model.js';
import {
  serializeUser,
  serializeUserSummary,
  User,
  type UserDoc,
} from './user.model.js';

type PrivacyKey = keyof UserDoc['privacy'];

const os = implement(contract.users).$context<ApiContext>();

async function findUserById(id: string) {
  return User.findById(id);
}

async function assertVisibleUser(
  userId: string,
  privacyKey: PrivacyKey,
  viewer: AuthPayload | undefined,
) {
  const user = await findUserById(userId);

  if (!user) {
    throw new ORPCError('USER_NOT_FOUND');
  }

  assertPrivacy(user, privacyKey, viewer?.id, viewer?.role);
}

function assertPrivacy(
  user: UserDoc,
  key: PrivacyKey,
  viewerId?: string,
  viewerRole?: 'user' | 'admin',
) {
  const isSelf = viewerId === user._id.toString();
  const isAdmin = viewerRole === 'admin';

  if (isSelf || isAdmin) {
    return;
  }

  if (user.privacy[key] === false) {
    throw new ORPCError('PRIVACY_DENIED');
  }
}

const list = os.list.use(requireAdmin).handler(async () => {
  const users = await User.find();
  return users.map(serializeUserSummary);
});

const getById = os.getById.handler(async ({ input }) => {
  const user = await findUserById(input.params.id);

  if (!user) {
    throw new ORPCError('USER_NOT_FOUND');
  }

  return serializeUser(user);
});

const getStats = os.getStats.handler(async ({ input }) => {
  const id = input.params.id;
  const user = await findUserById(id);

  if (!user) {
    throw new ORPCError('USER_NOT_FOUND');
  }

  const userObjectId = new mongoose.Types.ObjectId(id);

  const [
    myPosts,
    likedPosts,
    bookmarkedPosts,
    commentedPostIds,
    totalComments,
  ] = await Promise.all([
    Post.countDocuments({ userId: id, isDeleted: false }),
    Post.countDocuments({ likes: userObjectId, isDeleted: false }),
    Post.countDocuments({ bookmarks: userObjectId, isDeleted: false }),
    Comment.distinct('postId', { author: id, isDeleted: false }),
    Comment.countDocuments({ author: id, isDeleted: false }),
  ]);

  return {
    myPosts,
    likedPosts,
    bookmarkedPosts,
    commentedPosts: commentedPostIds.length,
    totalComments,
  };
});

const getFollowers = os.getFollowers.handler(async ({ input }) => {
  const user = await findUserById(input.params.id);

  if (!user) {
    throw new ORPCError('USER_NOT_FOUND');
  }

  const followers = await User.find({ _id: { $in: user.followers } });
  return followers.map(serializeUserSummary);
});

const getFollowing = os.getFollowing.handler(async ({ input }) => {
  const user = await findUserById(input.params.id);

  if (!user) {
    throw new ORPCError('USER_NOT_FOUND');
  }

  const following = await User.find({ _id: { $in: user.following } });
  return following.map(serializeUserSummary);
});

const getPosts = os.getPosts
  .use(optionalAuth)
  .handler(async ({ input, context }) => {
    await assertVisibleUser(input.params.id, 'showPosts', context.user);

    const posts = await Post.find({
      userId: input.params.id,
      visibility: 'public',
      isDeleted: false,
    }).populate('userId', POST_AUTHOR_SELECT);

    return posts.map(post => serializePost(post, context.user?.id));
  });

const getLikedPosts = os.getLikedPosts
  .use(optionalAuth)
  .handler(async ({ input, context }) => {
    await assertVisibleUser(input.params.id, 'showLikes', context.user);

    const posts = await Post.find({
      likes: new mongoose.Types.ObjectId(input.params.id),
      isDeleted: false,
    }).populate('userId', POST_AUTHOR_SELECT);

    return posts.map(post => serializePost(post, context.user?.id));
  });

const getBookmarkedPosts = os.getBookmarkedPosts
  .use(optionalAuth)
  .handler(async ({ input, context }) => {
    await assertVisibleUser(input.params.id, 'showBookmarked', context.user);

    const posts = await Post.find({
      bookmarks: new mongoose.Types.ObjectId(input.params.id),
      isDeleted: false,
    }).populate('userId', POST_AUTHOR_SELECT);

    return posts.map(post => serializePost(post, context.user?.id));
  });

const getCommentedPosts = os.getCommentedPosts
  .use(optionalAuth)
  .handler(async ({ input, context }) => {
    await assertVisibleUser(input.params.id, 'showComments', context.user);

    const postIds = await Comment.distinct('postId', {
      author: input.params.id,
      isDeleted: false,
    });
    const posts = await Post.find({
      _id: { $in: postIds },
      isDeleted: false,
    }).populate('userId', POST_AUTHOR_SELECT);

    return posts.map(post => serializePost(post, context.user?.id));
  });

const update = os.update
  .use(requireAuth)
  .handler(async ({ input, context }) => {
    assertOwnerOrAdmin(input.params.id, context.user!);

    const user = await User.findByIdAndUpdate(input.params.id, input.body, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      throw new ORPCError('USER_NOT_FOUND');
    }

    return serializeUser(user);
  });

const deleteUser = os.delete
  .use(requireAuth)
  .handler(async ({ input, context }) => {
    assertOwnerOrAdmin(input.params.id, context.user!);

    const user = await findUserById(input.params.id);

    if (!user) {
      throw new ORPCError('USER_NOT_FOUND');
    }

    const userId = user._id.toString();
    const userPosts = await Post.find({ userId }).select('_id');
    const postIds = userPosts.map(post => post._id);

    await Comment.deleteMany({ postId: { $in: postIds } });
    await Comment.deleteMany({ author: userId });
    await Post.deleteMany({ userId });
    await User.findByIdAndDelete(userId);

    return {
      ok: true as const,
      removed: serializeUser(user),
    };
  });

const follow = os.follow
  .use(requireAuth)
  .handler(async ({ input, context }) => {
    const viewerId = context.user!.id;

    if (input.params.id === viewerId) {
      throw new ORPCError('CANNOT_FOLLOW_SELF');
    }

    const target = await findUserById(input.params.id);

    if (!target) {
      throw new ORPCError('USER_NOT_FOUND');
    }

    const viewer = await findUserById(viewerId);

    if (!viewer) {
      throw new ORPCError('UNAUTHORIZED');
    }

    const targetObjectId = new mongoose.Types.ObjectId(input.params.id);
    const viewerObjectId = new mongoose.Types.ObjectId(viewerId);

    if (viewer.following.some(id => id.equals(targetObjectId))) {
      throw new ORPCError('ALREADY_FOLLOWING');
    }

    await User.findByIdAndUpdate(viewerId, {
      $addToSet: { following: targetObjectId },
    });
    await User.findByIdAndUpdate(input.params.id, {
      $addToSet: { followers: viewerObjectId },
    });

    const updatedViewer = await findUserById(viewerId);
    const updatedTarget = await findUserById(input.params.id);

    await createNotification({
      type: 'follow',
      to: input.params.id,
      from: viewerId,
    });

    return {
      message: `Ahora sigues a @${target.username}`,
      following: true,
      followersCount: updatedTarget?.followers.length ?? 0,
      followingCount: updatedViewer?.following.length ?? 0,
    };
  });

const unfollow = os.unfollow
  .use(requireAuth)
  .handler(async ({ input, context }) => {
    const viewerId = context.user!.id;

    if (input.params.id === viewerId) {
      throw new ORPCError('CANNOT_FOLLOW_SELF');
    }

    const target = await findUserById(input.params.id);

    if (!target) {
      throw new ORPCError('USER_NOT_FOUND');
    }

    const viewer = await findUserById(viewerId);

    if (!viewer) {
      throw new ORPCError('UNAUTHORIZED');
    }

    const targetObjectId = new mongoose.Types.ObjectId(input.params.id);
    const viewerObjectId = new mongoose.Types.ObjectId(viewerId);

    if (!viewer.following.some(id => id.equals(targetObjectId))) {
      throw new ORPCError('NOT_FOLLOWING');
    }

    await User.findByIdAndUpdate(viewerId, {
      $pull: { following: targetObjectId },
    });
    await User.findByIdAndUpdate(input.params.id, {
      $pull: { followers: viewerObjectId },
    });

    const updatedViewer = await findUserById(viewerId);
    const updatedTarget = await findUserById(input.params.id);

    return {
      message: `Ya no sigues a @${target.username}`,
      following: false,
      followersCount: updatedTarget?.followers.length ?? 0,
      followingCount: updatedViewer?.following.length ?? 0,
    };
  });

export const usersRouter = os.router({
  list,
  getStats,
  getFollowers,
  getFollowing,
  getPosts,
  getLikedPosts,
  getBookmarkedPosts,
  getCommentedPosts,
  getById,
  update,
  delete: deleteUser,
  follow,
  unfollow,
});

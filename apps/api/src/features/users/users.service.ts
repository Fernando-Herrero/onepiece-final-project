import { isAvatarPathSelectable } from '@logpose/contracts/common/avatar.schemas';
import { updateUserSchema } from '@logpose/contracts/common/user.schemas';
import { Injectable } from '@nestjs/common';
import { ORPCError } from '@orpc/server';
import { ObjectId } from 'mongodb';
import * as z from 'zod/v4';

import { CommentsPersistence } from '../comments/comments.persistence.js';
import { NotificationsPersistence } from '../notifications/notifications.persistence.js';
import { serializePost } from '../posts/post.model.js';
import { PostsPersistence } from '../posts/posts.persistence.js';
import {
  serializeUser,
  serializeUserRankingEntry,
  serializeUserSummary,
  type UserDocument,
} from './user.model.js';
import { UsersPersistence } from './users.persistence.js';

type PrivacyKey = keyof UserDocument['privacy'];
type UpdateUserBody = z.infer<typeof updateUserSchema>;

@Injectable()
export class UsersService {
  constructor(
    private readonly usersPersistence: UsersPersistence,
    private readonly postsPersistence: PostsPersistence,
    private readonly commentsPersistence: CommentsPersistence,
    private readonly notificationsPersistence: NotificationsPersistence,
  ) {}

  private async assertVisibleUser(
    userId: string,
    privacyKey: PrivacyKey,
    viewerId?: string,
  ) {
    const user = await this.usersPersistence.findById(userId);

    if (!user) {
      throw new ORPCError('USER_NOT_FOUND');
    }

    if (viewerId === userId) {
      return;
    }

    if (viewerId) {
      const role = await this.usersPersistence.findRoleById(viewerId);
      if (role === 'admin') {
        return;
      }
    }

    if (user.privacy[privacyKey] === false) {
      throw new ORPCError('PRIVACY_DENIED');
    }
  }

  private async assertOwnerOrAdmin(targetUserId: string, viewerId: string) {
    if (targetUserId === viewerId) {
      return;
    }

    const role = await this.usersPersistence.findRoleById(viewerId);

    if (!role) {
      throw new ORPCError('UNAUTHORIZED');
    }

    if (role !== 'admin') {
      throw new ORPCError('FORBIDDEN');
    }
  }

  private async assertAdmin(viewerId: string) {
    const role = await this.usersPersistence.findRoleById(viewerId);

    if (!role) {
      throw new ORPCError('UNAUTHORIZED');
    }

    if (role !== 'admin') {
      throw new ORPCError('FORBIDDEN');
    }
  }

  private async serializePostsWithAuthors(
    posts: Awaited<ReturnType<PostsPersistence['findPublicByUserId']>>,
    viewerId?: string,
  ) {
    const authorIds = [
      ...new Set(posts.map(post => post.userId.toString())),
    ];
    const authors = await this.usersPersistence.findByIds(
      authorIds.map(id => new ObjectId(id)),
    );
    const authorById = new Map(
      authors.map(author => [author._id.toString(), author]),
    );

    return posts.map(post => {
      const author = authorById.get(post.userId.toString());

      if (!author) {
        throw new ORPCError('USER_NOT_FOUND');
      }

      return serializePost(post, author, viewerId);
    });
  }

  async getById(userId: string) {
    const user = await this.usersPersistence.findById(userId);

    if (!user) {
      throw new ORPCError('USER_NOT_FOUND');
    }

    return serializeUser(user);
  }

  async getStats(userId: string) {
    const user = await this.usersPersistence.findById(userId);

    if (!user) {
      throw new ORPCError('USER_NOT_FOUND');
    }

    const [
      myPosts,
      likedPosts,
      bookmarkedPosts,
      commentedPostIds,
      totalComments,
    ] = await Promise.all([
      this.postsPersistence.countByUserId(userId),
      this.postsPersistence.countLikedByUserId(userId),
      this.postsPersistence.countBookmarkedByUserId(userId),
      this.commentsPersistence.distinctPostIdsByAuthor(userId),
      this.commentsPersistence.countByAuthor(userId),
    ]);

    return {
      myPosts,
      likedPosts,
      bookmarkedPosts,
      commentedPosts: commentedPostIds.length,
      totalComments,
    };
  }

  async ranking() {
    const users = await this.usersPersistence.findRanking(20);
    return users.map(serializeUserRankingEntry);
  }

  async getFollowers(userId: string) {
    const user = await this.usersPersistence.findById(userId);

    if (!user) {
      throw new ORPCError('USER_NOT_FOUND');
    }

    const followers = await this.usersPersistence.findByIds(user.followers);
    return followers.map(serializeUserSummary);
  }

  async getFollowing(userId: string) {
    const user = await this.usersPersistence.findById(userId);

    if (!user) {
      throw new ORPCError('USER_NOT_FOUND');
    }

    const following = await this.usersPersistence.findByIds(user.following);
    return following.map(serializeUserSummary);
  }

  async follow(viewerId: string, targetUserId: string) {
    if (targetUserId === viewerId) {
      throw new ORPCError('CANNOT_FOLLOW_SELF');
    }

    const target = await this.usersPersistence.findById(targetUserId);

    if (!target) {
      throw new ORPCError('USER_NOT_FOUND');
    }

    const viewer = await this.usersPersistence.findById(viewerId);

    if (!viewer) {
      throw new ORPCError('UNAUTHORIZED');
    }

    const targetObjectId = new ObjectId(targetUserId);

    if (viewer.following.some(id => id.equals(targetObjectId))) {
      throw new ORPCError('ALREADY_FOLLOWING');
    }

    await this.usersPersistence.addFollow(viewerId, targetUserId);

    const updatedViewer = await this.usersPersistence.findById(viewerId);
    const updatedTarget = await this.usersPersistence.findById(targetUserId);

    await this.notificationsPersistence.createFollow(targetUserId, viewerId);

    return {
      message: `Ahora sigues a @${target.username}`,
      following: true,
      followersCount: updatedTarget?.followers.length ?? 0,
      followingCount: updatedViewer?.following.length ?? 0,
    };
  }

  async unfollow(viewerId: string, targetUserId: string) {
    if (targetUserId === viewerId) {
      throw new ORPCError('CANNOT_FOLLOW_SELF');
    }

    const target = await this.usersPersistence.findById(targetUserId);

    if (!target) {
      throw new ORPCError('USER_NOT_FOUND');
    }

    const viewer = await this.usersPersistence.findById(viewerId);

    if (!viewer) {
      throw new ORPCError('UNAUTHORIZED');
    }

    const targetObjectId = new ObjectId(targetUserId);

    if (!viewer.following.some(id => id.equals(targetObjectId))) {
      throw new ORPCError('NOT_FOLLOWING');
    }

    await this.usersPersistence.removeFollow(viewerId, targetUserId);

    const updatedViewer = await this.usersPersistence.findById(viewerId);
    const updatedTarget = await this.usersPersistence.findById(targetUserId);

    return {
      message: `Ya no sigues a @${target.username}`,
      following: false,
      followersCount: updatedTarget?.followers.length ?? 0,
      followingCount: updatedViewer?.following.length ?? 0,
    };
  }

  async getPosts(profileUserId: string, viewerId?: string) {
    await this.assertVisibleUser(profileUserId, 'showPosts', viewerId);

    const posts = await this.postsPersistence.findPublicByUserId(profileUserId);
    return this.serializePostsWithAuthors(posts, viewerId);
  }

  async getLikedPosts(profileUserId: string, viewerId?: string) {
    await this.assertVisibleUser(profileUserId, 'showLikes', viewerId);

    const posts = await this.postsPersistence.findLikedByUserId(profileUserId);
    return this.serializePostsWithAuthors(posts, viewerId);
  }

  async getBookmarkedPosts(profileUserId: string, viewerId?: string) {
    await this.assertVisibleUser(profileUserId, 'showBookmarked', viewerId);

    const posts =
      await this.postsPersistence.findBookmarkedByUserId(profileUserId);
    return this.serializePostsWithAuthors(posts, viewerId);
  }

  async getCommentedPosts(profileUserId: string, viewerId?: string) {
    await this.assertVisibleUser(profileUserId, 'showComments', viewerId);

    const postIds =
      await this.commentsPersistence.distinctPostIdsByAuthor(profileUserId);
    const posts = await this.postsPersistence.findByIds(postIds);
    return this.serializePostsWithAuthors(posts, viewerId);
  }

  async update(targetUserId: string, viewerId: string, body: UpdateUserBody) {
    await this.assertOwnerOrAdmin(targetUserId, viewerId);

    const user = await this.usersPersistence.findById(targetUserId);

    if (!user) {
      throw new ORPCError('USER_NOT_FOUND');
    }

    if (
      body.avatar !== undefined &&
      !isAvatarPathSelectable(body.avatar, user.serieProgress, user.avatar)
    ) {
      throw new ORPCError('FORBIDDEN');
    }

    const updatedUser = await this.usersPersistence.updateById(
      targetUserId,
      body,
    );

    if (!updatedUser) {
      throw new ORPCError('USER_NOT_FOUND');
    }

    return serializeUser(updatedUser);
  }

  async list(viewerId: string) {
    await this.assertAdmin(viewerId);

    const users = await this.usersPersistence.findAll();
    return users.map(serializeUserSummary);
  }

  async delete(targetUserId: string, viewerId: string) {
    await this.assertOwnerOrAdmin(targetUserId, viewerId);

    const user = await this.usersPersistence.findById(targetUserId);

    if (!user) {
      throw new ORPCError('USER_NOT_FOUND');
    }

    const userId = user._id.toString();
    const userPosts = await this.postsPersistence.findIdsByUserId(userId);
    const postIds = userPosts.map(post => post._id);

    await this.commentsPersistence.deleteByPostIds(postIds);
    await this.commentsPersistence.deleteByAuthor(userId);
    await this.postsPersistence.deleteByUserId(userId);
    await this.usersPersistence.deleteById(userId);

    return {
      ok: true as const,
      removed: serializeUser(user),
    };
  }
}

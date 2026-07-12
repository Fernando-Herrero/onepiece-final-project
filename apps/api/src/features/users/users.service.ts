import { isAvatarPathSelectable } from '@logpose/contracts/common/avatar.schemas';
import { updateUserSchema } from '@logpose/contracts/common/user.schemas';
import { Injectable } from '@nestjs/common';
import { ORPCError } from '@orpc/server';
import { ObjectId } from 'mongodb';
import * as z from 'zod/v4';

import { CommentsPersistence } from '../comments/comments.persistence.js';
import { NotificationsPersistence } from '../notifications/notifications.persistence.js';
import { serializePost } from '../posts/post.mappers.js';
import { PostsPersistence } from '../posts/posts.persistence.js';
import {
  serializeUser,
  serializeUserRankingEntry,
  serializeUserSummary,
  type UserDocument,
} from './user.mappers.js';
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

  /** Comprueba que el usuario existe en Mongo; lanza USER_NOT_FOUND si no. */
  private async requireUser(id: string) {
    const user = await this.usersPersistence.findById(id);

    if (!user) {
      throw new ORPCError('USER_NOT_FOUND');
    }

    return user;
  }

  /**
   * Respeta privacidad del perfil para un tab concreto (posts, likes…).
   * El propio usuario y los admin siempre pueden ver; el resto depende de user.privacy.
   */
  private async assertVisibleUser(
    userId: string,
    privacyKey: PrivacyKey,
    viewerId?: string,
  ) {
    const user = await this.requireUser(userId);

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

  /** Solo el dueño del perfil o un admin pueden modificar/eliminar ese usuario. */
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

  /** Exige rol admin; usado en listado de usuarios. */
  private async assertAdmin(viewerId: string) {
    const role = await this.usersPersistence.findRoleById(viewerId);

    if (!role) {
      throw new ORPCError('UNAUTHORIZED');
    }

    if (role !== 'admin') {
      throw new ORPCError('FORBIDDEN');
    }
  }

  /** Enriquece posts públicos con datos del autor y flags de interacción del viewer. */
  private async serializePostsWithAuthors(
    posts: Awaited<ReturnType<PostsPersistence['findPublicByUserId']>>,
    viewerId?: string,
  ) {
    const authorIds = [...new Set(posts.map(post => post.userId.toString()))];
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

  /** Perfil público completo por id (userPublic). */
  async getById(userId: string) {
    const user = await this.requireUser(userId);

    return serializeUser(user);
  }

  /** Contadores de actividad del perfil: posts, likes, bookmarks y comentarios. */
  async getStats(userId: string) {
    await this.requireUser(userId);

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

  /** Top 20 usuarios por experiencia (sidebar ranking del perfil). */
  async ranking() {
    const users = await this.usersPersistence.findRanking(20);
    return users.map(serializeUserRankingEntry);
  }

  /** Lista resumida de seguidores del usuario. */
  async getFollowers(userId: string) {
    const user = await this.requireUser(userId);

    const followers = await this.usersPersistence.findByIds(user.followers);
    return followers.map(serializeUserSummary);
  }

  /** Lista resumida de cuentas que sigue el usuario. */
  async getFollowing(userId: string) {
    const user = await this.requireUser(userId);

    const following = await this.usersPersistence.findByIds(user.following);
    return following.map(serializeUserSummary);
  }

  /** El viewer sigue al target; actualiza grafos y crea notificación de follow. */
  async follow(viewerId: string, targetUserId: string) {
    if (targetUserId === viewerId) {
      throw new ORPCError('CANNOT_FOLLOW_SELF');
    }

    const target = await this.requireUser(targetUserId);

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

  /** El viewer deja de seguir al target y devuelve contadores actualizados. */
  async unfollow(viewerId: string, targetUserId: string) {
    if (targetUserId === viewerId) {
      throw new ORPCError('CANNOT_FOLLOW_SELF');
    }

    const target = await this.requireUser(targetUserId);

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

  /** Posts publicados por el perfil; respeta showPosts si el viewer no es el dueño. */
  async getPosts(profileUserId: string, viewerId?: string) {
    await this.assertVisibleUser(profileUserId, 'showPosts', viewerId);

    const posts = await this.postsPersistence.findPublicByUserId(profileUserId);
    return this.serializePostsWithAuthors(posts, viewerId);
  }

  /** Posts que el perfil ha marcado con like; respeta showLikes. */
  async getLikedPosts(profileUserId: string, viewerId?: string) {
    await this.assertVisibleUser(profileUserId, 'showLikes', viewerId);

    const posts = await this.postsPersistence.findLikedByUserId(profileUserId);
    return this.serializePostsWithAuthors(posts, viewerId);
  }

  /** Posts guardados en bookmarks del perfil; respeta showBookmarked. */
  async getBookmarkedPosts(profileUserId: string, viewerId?: string) {
    await this.assertVisibleUser(profileUserId, 'showBookmarked', viewerId);

    const posts =
      await this.postsPersistence.findBookmarkedByUserId(profileUserId);
    return this.serializePostsWithAuthors(posts, viewerId);
  }

  /** Posts en los que el perfil ha comentado; respeta showComments. */
  async getCommentedPosts(profileUserId: string, viewerId?: string) {
    await this.assertVisibleUser(profileUserId, 'showComments', viewerId);

    const postIds =
      await this.commentsPersistence.distinctPostIdsByAuthor(profileUserId);
    const posts = await this.postsPersistence.findByIds(postIds);
    return this.serializePostsWithAuthors(posts, viewerId);
  }

  /** Actualiza campos del perfil; valida avatar desbloqueado según progreso de serie. */
  async update(targetUserId: string, viewerId: string, body: UpdateUserBody) {
    await this.assertOwnerOrAdmin(targetUserId, viewerId);

    const user = await this.requireUser(targetUserId);

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

  /** Listado de todos los usuarios (solo admin). */
  async list(viewerId: string) {
    await this.assertAdmin(viewerId);

    const users = await this.usersPersistence.findAll();
    return users.map(serializeUserSummary);
  }

  /**
   * Borra cuenta y datos relacionados (posts y comentarios).
   * Solo el propio usuario o un admin.
   */
  async delete(targetUserId: string, viewerId: string) {
    await this.assertOwnerOrAdmin(targetUserId, viewerId);

    const user = await this.requireUser(targetUserId);

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

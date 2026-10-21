import { isAvatarPathSelectable } from '@logpose/contracts/common/avatar.schemas';
import { updateUserSchema } from '@logpose/contracts/common/user.schemas';
import type { updatePreferencesSchema } from '@logpose/contracts/features/users/schemas';
import { Injectable } from '@nestjs/common';
import { ORPCError } from '@orpc/server';
import { ObjectId } from 'mongodb';
import * as z from 'zod/v4';

import { isDuplicateKeyError } from '../../integrations/mongodb/duplicate-key-error.js';
import {
  accessTo,
  canSeeTab,
  type PrivacyKey,
  type UserViewer,
  type Viewer,
  visiblePostsFilter,
} from '../auth/access.js';
import { CommentsPersistence } from '../comments/comments.persistence.js';
import { NotificationsPersistence } from '../notifications/notifications.persistence.js';
import { serializePostsForViewer } from '../posts/posts.mappers.js';
import { PostsPersistence } from '../posts/posts.persistence.js';
import {
  serializeSessionUser,
  serializeUserProfile,
  serializeUserRankingEntry,
  serializeUserSummary,
  withPreferenceDefaults,
} from './user.mappers.js';
import { UsersPersistence } from './users.persistence.js';

type UpdateUserBody = z.infer<typeof updateUserSchema>;
type UpdatePreferencesBody = z.infer<typeof updatePreferencesSchema>;

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

  /** Lanza PRIVACY_DENIED si el viewer no puede ver esa pestaña del perfil. */
  private async assertVisibleUser(
    userId: string,
    privacyKey: PrivacyKey,
    viewer: Viewer,
  ) {
    const user = await this.requireUser(userId);

    if (!canSeeTab(viewer, user, privacyKey)) {
      throw new ORPCError('PRIVACY_DENIED');
    }
  }

  /** Posts publicados por el perfil; respeta showPosts si el viewer no es el dueño. */
  async getPosts(profileUserId: string, viewer: Viewer) {
    await this.assertVisibleUser(profileUserId, 'showPosts', viewer);
    const visible = await visiblePostsFilter(viewer, this.usersPersistence);

    const posts = await this.postsPersistence.findByUserId(
      profileUserId,
      visible,
    );
    return serializePostsForViewer(posts, viewer, visible, {
      posts: this.postsPersistence,
      users: this.usersPersistence,
    });
  }

  /** Posts que el perfil ha marcado con like; respeta showLikes. */
  async getLikedPosts(profileUserId: string, viewer: Viewer) {
    await this.assertVisibleUser(profileUserId, 'showLikes', viewer);
    const visible = await visiblePostsFilter(viewer, this.usersPersistence);

    const posts = await this.postsPersistence.findLikedByUserId(
      profileUserId,
      visible,
    );
    return serializePostsForViewer(posts, viewer, visible, {
      posts: this.postsPersistence,
      users: this.usersPersistence,
    });
  }

  /** Posts guardados en bookmarks del perfil; respeta showBookmarked. */
  async getBookmarkedPosts(profileUserId: string, viewer: Viewer) {
    await this.assertVisibleUser(profileUserId, 'showBookmarked', viewer);
    const visible = await visiblePostsFilter(viewer, this.usersPersistence);

    const posts = await this.postsPersistence.findBookmarkedByUserId(
      profileUserId,
      visible,
    );
    return serializePostsForViewer(posts, viewer, visible, {
      posts: this.postsPersistence,
      users: this.usersPersistence,
    });
  }

  /** Posts en los que el perfil ha comentado; respeta showComments. */
  async getCommentedPosts(profileUserId: string, viewer: Viewer) {
    await this.assertVisibleUser(profileUserId, 'showComments', viewer);
    const visible = await visiblePostsFilter(viewer, this.usersPersistence);

    const postIds =
      await this.commentsPersistence.distinctPostIdsByAuthor(profileUserId);
    const posts = await this.postsPersistence.findByIds(postIds, visible);
    return serializePostsForViewer(posts, viewer, visible, {
      posts: this.postsPersistence,
      users: this.usersPersistence,
    });
  }

  async getById(userId: string, viewer: Viewer) {
    const user = await this.requireUser(userId);

    return accessTo(viewer, userId) === 'full'
      ? { access: 'full' as const, ...serializeSessionUser(user) }
      : { access: 'public' as const, ...serializeUserProfile(user) };
  }

  /**
   * Contadores de actividad del perfil: posts, likes, bookmarks y comentarios.
   * Cada uno cuenta lo mismo que lista su pestaña, y si `privacy` la oculta al
   * viewer, su clave no viene (`showComments` cubre los dos de comentarios).
   */
  async getStats(userId: string, viewer: Viewer) {
    const user = await this.requireUser(userId);
    const visible = await visiblePostsFilter(viewer, this.usersPersistence);
    const shows = (privacyKey: PrivacyKey) =>
      canSeeTab(viewer, user, privacyKey);

    const [myPosts, likedPosts, bookmarkedPosts, comments] = await Promise.all([
      shows('showPosts')
        ? this.postsPersistence.countByUserId(userId, visible)
        : null,
      shows('showLikes')
        ? this.postsPersistence.countLikedByUserId(userId, visible)
        : null,
      shows('showBookmarked')
        ? this.postsPersistence.countBookmarkedByUserId(userId, visible)
        : null,
      // Los dos de comentarios solo miran los posts comentados que el viewer ve.
      shows('showComments')
        ? this.commentsPersistence
            .distinctPostIdsByAuthor(userId)
            .then(ids => this.postsPersistence.findVisibleIds(ids, visible))
            .then(async postIds => ({
              commentedPosts: postIds.length,
              totalComments: await this.commentsPersistence.countByAuthor(
                userId,
                postIds,
              ),
            }))
        : null,
    ]);

    return {
      ...(myPosts !== null && { myPosts }),
      ...(likedPosts !== null && { likedPosts }),
      ...(bookmarkedPosts !== null && { bookmarkedPosts }),
      ...comments,
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

    await this.notificationsPersistence.create({
      type: 'follow',
      to: targetUserId,
      from: viewerId,
    });

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

  /** Actualiza campos del perfil; valida avatar desbloqueado según progreso de serie. */
  async update(targetUserId: string, viewer: UserViewer, body: UpdateUserBody) {
    if (accessTo(viewer, targetUserId) !== 'full') {
      throw new ORPCError('FORBIDDEN');
    }

    const user = await this.requireUser(targetUserId);

    if (
      body.avatar !== undefined &&
      !isAvatarPathSelectable(body.avatar, user.serieProgress, user.avatar)
    ) {
      throw new ORPCError('FORBIDDEN');
    }

    const updatedUser = await this.usersPersistence
      .updateById(targetUserId, body)
      .catch((error: unknown) => {
        if (isDuplicateKeyError(error)) {
          throw new ORPCError('USERNAME_TAKEN');
        }
        throw error;
      });

    if (!updatedUser) {
      throw new ORPCError('USER_NOT_FOUND');
    }

    return serializeSessionUser(updatedUser);
  }

  /** Listado de todos los usuarios (solo admin). */
  async list(viewer: UserViewer) {
    if (viewer.role !== 'admin') {
      throw new ORPCError('FORBIDDEN');
    }

    const users = await this.usersPersistence.findAll();
    return users.map(serializeUserSummary);
  }

  /**
   * Borra cuenta y datos relacionados (posts y comentarios).
   * Solo el propio usuario o un admin.
   */
  async delete(targetUserId: string, viewer: UserViewer) {
    if (accessTo(viewer, targetUserId) !== 'full') {
      throw new ORPCError('FORBIDDEN');
    }

    const user = await this.requireUser(targetUserId);

    const userId = user._id.toString();
    const userPosts = await this.postsPersistence.findIdsByUserId(userId);
    const postIds = userPosts.map(post => post._id);

    await this.commentsPersistence.deleteByPostIds(postIds);
    await this.commentsPersistence.deleteByAuthor(userId);
    await this.postsPersistence.deleteRetweetsOf(postIds);
    await this.postsPersistence.deleteByUserId(userId);
    await this.usersPersistence.deleteById(userId);

    return {
      ok: true as const,
      removed: serializeSessionUser(user),
    };
  }

  /**
   * Marca la cuenta como verificada tras el pago simulado de premium.
   * `verified` no puede viajar por `update` (updateUserSchema es strict sobre
   * campos de perfil), de ahí el endpoint dedicado.
   */
  async verify(targetUserId: string, viewer: UserViewer) {
    return this.setVerified(targetUserId, viewer, true);
  }

  /** Cancela premium y retira la insignia. */
  async unverify(targetUserId: string, viewer: UserViewer) {
    return this.setVerified(targetUserId, viewer, false);
  }

  private async setVerified(
    targetUserId: string,
    viewer: UserViewer,
    verified: boolean,
  ) {
    if (accessTo(viewer, targetUserId) !== 'full') {
      throw new ORPCError('FORBIDDEN');
    }
    await this.requireUser(targetUserId);

    const updated = await this.usersPersistence.updateById(targetUserId, {
      verified,
    });

    if (!updated) {
      throw new ORPCError('USER_NOT_FOUND');
    }

    return {
      ok: true as const,
      user: serializeSessionUser(updated),
    };
  }

  /**
   * Merge parcial por grupo: el cliente envía solo el bloque que ha tocado
   * (notifications | timeline | accessibility) y el resto se conserva.
   */
  async updatePreferences(
    targetUserId: string,
    viewer: UserViewer,
    body: UpdatePreferencesBody,
  ) {
    if (accessTo(viewer, targetUserId) !== 'full') {
      throw new ORPCError('FORBIDDEN');
    }

    const user = await this.requireUser(targetUserId);
    const current = withPreferenceDefaults(user.preferences);

    const updated = await this.usersPersistence.updateById(targetUserId, {
      preferences: {
        notifications: { ...current.notifications, ...body.notifications },
        timeline: { ...current.timeline, ...body.timeline },
        accessibility: { ...current.accessibility, ...body.accessibility },
      },
    });

    if (!updated) {
      throw new ORPCError('USER_NOT_FOUND');
    }

    return serializeSessionUser(updated);
  }
}

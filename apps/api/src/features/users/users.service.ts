import { MongoTransactionService } from '@jperezmart/nest-mongodb';
import { isAvatarPathSelectable } from '@logpose/contracts/common/avatar.schemas';
import type { PostPageQuery } from '@logpose/contracts/common/post.schemas';
import { updateUserSchema } from '@logpose/contracts/common/user.schemas';
import type { updatePreferencesSchema } from '@logpose/contracts/features/users/schemas';
import { Injectable } from '@nestjs/common';
import { ORPCError } from '@orpc/server';
import { type Filter, ObjectId } from 'mongodb';
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
import { SessionsPersistence } from '../auth/sessions.persistence.js';
import { CommentsPersistence } from '../comments/comments.persistence.js';
import { NotificationsPersistence } from '../notifications/notifications.persistence.js';
import {
  type PostDocument,
  serializePostsForViewer,
} from '../posts/posts.mappers.js';
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

/** Qué posts lista y cuenta cada pestaña del perfil; comentados va aparte (pide un `distinct`). */
const tabFilters = {
  posts: (userId: string) => ({ userId: new ObjectId(userId) }),
  liked: (userId: string) => ({ likes: new ObjectId(userId) }),
  bookmarked: (userId: string) => ({ bookmarks: new ObjectId(userId) }),
};

@Injectable()
export class UsersService {
  constructor(
    private readonly usersPersistence: UsersPersistence,
    private readonly postsPersistence: PostsPersistence,
    private readonly commentsPersistence: CommentsPersistence,
    private readonly notificationsPersistence: NotificationsPersistence,
    private readonly sessionsPersistence: SessionsPersistence,
    private readonly transactions: MongoTransactionService,
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
   * Una página de una pestaña del perfil. Lanza PRIVACY_DENIED si `privacy`
   * oculta la pestaña al viewer.
   */
  private async getTabPage(
    profileUserId: string,
    viewer: Viewer,
    query: PostPageQuery,
    privacyKey: PrivacyKey,
    filter: Filter<PostDocument>,
  ) {
    const user = await this.requireUser(profileUserId);

    if (!canSeeTab(viewer, user, privacyKey)) {
      throw new ORPCError('PRIVACY_DENIED');
    }

    const visible = await visiblePostsFilter(viewer, this.usersPersistence);
    const page = await this.postsPersistence.findPage(filter, visible, query);

    return {
      ...page,
      posts: await serializePostsForViewer(page.posts, viewer, visible, {
        posts: this.postsPersistence,
        users: this.usersPersistence,
      }),
    };
  }

  /** Posts publicados por el perfil; respeta showPosts si el viewer no es el dueño. */
  getPosts(profileUserId: string, viewer: Viewer, query: PostPageQuery) {
    return this.getTabPage(
      profileUserId,
      viewer,
      query,
      'showPosts',
      tabFilters.posts(profileUserId),
    );
  }

  /** Posts que el perfil ha marcado con like; respeta showLikes. */
  getLikedPosts(profileUserId: string, viewer: Viewer, query: PostPageQuery) {
    return this.getTabPage(
      profileUserId,
      viewer,
      query,
      'showLikes',
      tabFilters.liked(profileUserId),
    );
  }

  /** Posts guardados en bookmarks del perfil; respeta showBookmarked. */
  getBookmarkedPosts(
    profileUserId: string,
    viewer: Viewer,
    query: PostPageQuery,
  ) {
    return this.getTabPage(
      profileUserId,
      viewer,
      query,
      'showBookmarked',
      tabFilters.bookmarked(profileUserId),
    );
  }

  /** Posts en los que el perfil ha comentado; respeta showComments. */
  async getCommentedPosts(
    profileUserId: string,
    viewer: Viewer,
    query: PostPageQuery,
  ) {
    const postIds =
      await this.commentsPersistence.distinctPostIdsByAuthor(profileUserId);

    // Sin índice para `_id: $in` + este orden: Mongo ordena en memoria los
    // comentados del perfil; vale mientras sean cientos.
    return this.getTabPage(profileUserId, viewer, query, 'showComments', {
      _id: { $in: postIds },
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
        ? this.postsPersistence.count(tabFilters.posts(userId), visible)
        : null,
      shows('showLikes')
        ? this.postsPersistence.count(tabFilters.liked(userId), visible)
        : null,
      shows('showBookmarked')
        ? this.postsPersistence.count(tabFilters.bookmarked(userId), visible)
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

  /** El viewer sigue al target; crea la notificación de follow. */
  follow(viewerId: string, targetUserId: string) {
    return this.setFollowing(viewerId, targetUserId, true);
  }

  unfollow(viewerId: string, targetUserId: string) {
    return this.setFollowing(viewerId, targetUserId, false);
  }

  /** Lleva el follow al estado pedido y devuelve los contadores actualizados. */
  private async setFollowing(
    viewerId: string,
    targetUserId: string,
    following: boolean,
  ) {
    if (targetUserId === viewerId) {
      throw new ORPCError('CANNOT_FOLLOW_SELF');
    }

    const target = await this.requireUser(targetUserId);
    const viewer = await this.usersPersistence.findById(viewerId);

    if (!viewer) {
      throw new ORPCError('UNAUTHORIZED');
    }

    const isFollowing = viewer.following.some(id => id.equals(targetUserId));

    if (isFollowing === following) {
      throw new ORPCError(following ? 'ALREADY_FOLLOWING' : 'NOT_FOLLOWING');
    }

    if (following) {
      await this.usersPersistence.addFollow(viewerId, targetUserId);
      await this.notificationsPersistence.create({
        type: 'follow',
        to: targetUserId,
        from: viewerId,
      });
    } else {
      await this.usersPersistence.removeFollow(viewerId, targetUserId);
    }

    const updatedViewer = await this.usersPersistence.findById(viewerId);
    const updatedTarget = await this.usersPersistence.findById(targetUserId);

    return {
      message: following
        ? `Ahora sigues a @${target.username}`
        : `Ya no sigues a @${target.username}`,
      following,
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
      !isAvatarPathSelectable(body.avatar, user.lastWatchedEpisode, user.avatar)
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
   * Borra la cuenta y todo lo que cuelga de ella en una transacción: si una
   * escritura falla, no queda nada a medias. Solo el propio usuario o un admin.
   */
  async delete(targetUserId: string, viewer: UserViewer) {
    if (accessTo(viewer, targetUserId) !== 'full') {
      throw new ORPCError('FORBIDDEN');
    }

    const user = await this.requireUser(targetUserId);

    await this.transactions.withTransaction(async session => {
      const postIds = await this.postsPersistence.deleteByUser(
        targetUserId,
        session,
      );
      const touchedPostIds = await this.commentsPersistence.deleteByUser(
        targetUserId,
        postIds,
        session,
      );
      const commentCounts = await this.commentsPersistence.countActiveByPost(
        touchedPostIds,
        session,
      );
      await this.postsPersistence.syncCommentsCount(commentCounts, session);
      await this.notificationsPersistence.deleteByUser(targetUserId, session);
      await this.sessionsPersistence.deleteByUser(targetUserId, session);
      await this.usersPersistence.deleteWithFollows(targetUserId, session);
    });

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

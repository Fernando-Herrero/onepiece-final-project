import { type Filter, ObjectId, type WithId } from 'mongodb';

import type { PostDocument } from '../posts/posts.mappers.js';
import type { UserDocument, UserRole } from '../users/user.mappers.js';
import type { UsersPersistence } from '../users/users.persistence.js';

/** Quién hace la petición. Lo resuelve `SessionGuard` una vez por request. */
export type Viewer =
  | { kind: 'anonymous' }
  | { kind: 'user'; id: string; role: UserRole };

export type UserViewer = Extract<Viewer, { kind: 'user' }>;

export type PrivacyKey = keyof UserDocument['privacy'];

/** `full` para uno mismo y el admin; `public` para el resto. */
export function accessTo(viewer: Viewer, ownerId: string): 'full' | 'public' {
  return viewer.kind === 'user' &&
    (viewer.id === ownerId || viewer.role === 'admin')
    ? 'full'
    : 'public';
}

export function canSeeTab(
  viewer: Viewer,
  owner: Pick<WithId<UserDocument>, '_id' | 'privacy'>,
  privacyKey: PrivacyKey,
) {
  return (
    owner.privacy[privacyKey] ||
    accessTo(viewer, owner._id.toString()) === 'full'
  );
}

/**
 * Posts que ve el viewer, como filtro de Mongo para que el feed pagine sobre
 * lo visible: público para todos; `followers` para quien sigue al dueño;
 * todo lo suyo para el dueño, y todo para el admin.
 */
export async function visiblePostsFilter(
  viewer: Viewer,
  usersPersistence: UsersPersistence,
): Promise<Filter<PostDocument>> {
  if (viewer.kind === 'anonymous') {
    return { visibility: 'public' };
  }

  if (viewer.role === 'admin') {
    return {};
  }

  const following = await usersPersistence.findFollowingIds(viewer.id);

  return {
    $or: [
      { visibility: 'public' },
      { userId: new ObjectId(viewer.id) },
      { visibility: 'followers', userId: { $in: following } },
    ],
  };
}

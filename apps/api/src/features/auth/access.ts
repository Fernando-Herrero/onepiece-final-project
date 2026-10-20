import type { WithId } from 'mongodb';

import type { UserDocument, UserRole } from '../users/user.mappers.js';

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

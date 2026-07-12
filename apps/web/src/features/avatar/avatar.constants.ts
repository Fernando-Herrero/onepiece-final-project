import { AVATAR_OPTIONS } from '@logpose/contracts/common/avatar.schemas';

export const DEFAULT_AVATAR_SRC =
  AVATAR_OPTIONS.find(option => option.id === 'luffy')?.path ??
  '/avatars/luffy/luffy-happy-400.webp';

const KNOWN_AVATAR_PATHS = new Set(AVATAR_OPTIONS.map(option => option.path));

/** Maps v3 `/avatars/...` paths; legacy v2 `/pictures/user/...` → default (avoids 404). */
export function resolveAvatarSrc(avatar?: string): string {
  const trimmed = avatar?.trim();
  if (!trimmed) {
    return DEFAULT_AVATAR_SRC;
  }
  if (KNOWN_AVATAR_PATHS.has(trimmed)) {
    return trimmed;
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return DEFAULT_AVATAR_SRC;
}

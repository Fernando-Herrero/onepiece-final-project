import { AVATAR_OPTIONS } from '@logpose/contracts/common/avatar.schemas';

import type {
  ProfilePostsEmptyMessageKey,
  ProfilePostsPrivateMessageKey,
  ProfilePostsPrivateMessageOtherKey,
  ProfilePostsTab,
  ProfilePostsTabConfig,
} from '@/features/profile/profile.types';

export const DEFAULT_AVATAR_SRC =
  AVATAR_OPTIONS.find(option => option.id === 'luffy')?.path ??
  '/avatars/luffy/luffy-happy-400.webp';

const KNOWN_AVATAR_PATHS = new Set(AVATAR_OPTIONS.map(option => option.path));

/** Maps v3 `/avatars/...` paths; legacy v2 `/pictures/user/...` → default (avoids 404). */
export function resolveProfileAvatarSrc(avatar?: string): string {
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

/** Suma XP de `apps/api/src/data/serie/episodes.json` (semilla actual). */
export const SERIE_TOTAL_XP = 8900;

export const PROFILE_UNLOCKED_CARD_KEYS = [
  'characters',
  'items',
  'fruits',
  'swords',
  'boats',
] as const;

export const PROFILE_POSTS_TAB_CONFIG: ProfilePostsTabConfig[] = [
  { key: 'posts', labelKey: 'profile.posts', privacyKey: 'showPosts' },
  { key: 'liked', labelKey: 'profile.likes', privacyKey: 'showLikes' },
  {
    key: 'bookmarked',
    labelKey: 'profile.bookmarks',
    privacyKey: 'showBookmarked',
  },
  {
    key: 'comments',
    labelKey: 'profile.comments',
    privacyKey: 'showComments',
  },
];

export const PROFILE_POSTS_EMPTY_MESSAGE_KEY: Record<
  ProfilePostsTab,
  ProfilePostsEmptyMessageKey
> = {
  posts: 'profile.no_posts',
  liked: 'profile.no_liked_posts',
  bookmarked: 'profile.no_bookmarked_posts',
  comments: 'profile.no_commented_posts',
};

export const PROFILE_POSTS_PRIVATE_MESSAGE_KEY: Record<
  ProfilePostsTab,
  ProfilePostsPrivateMessageKey
> = {
  posts: 'profile.private_content',
  liked: 'profile.private_likes',
  bookmarked: 'profile.private_bookmarks',
  comments: 'profile.private_comments',
};

export const PROFILE_POSTS_PRIVATE_MESSAGE_KEY_OTHER: Record<
  ProfilePostsTab,
  ProfilePostsPrivateMessageOtherKey
> = {
  posts: 'profile.private_content_other',
  liked: 'profile.private_likes_other',
  bookmarked: 'profile.private_bookmarks_other',
  comments: 'profile.private_comments_other',
};

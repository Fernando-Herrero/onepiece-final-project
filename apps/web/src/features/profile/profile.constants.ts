import type {
  ProfilePostsEmptyMessageKey,
  ProfilePostsPrivateMessageKey,
  ProfilePostsPrivateMessageOtherKey,
  ProfilePostsTab,
  ProfilePostsTabConfig,
} from '@/features/profile/profile.types';

export type UserDisplayNameFields = {
  displayName?: string;
  firstName: string;
  lastName: string;
  username: string;
};

export function getUserDisplayName(user: UserDisplayNameFields): string {
  const displayName = user.displayName?.trim();
  if (displayName) {
    return displayName;
  }

  const fullName = `${user.firstName} ${user.lastName}`.trim();
  return fullName || user.username;
}

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

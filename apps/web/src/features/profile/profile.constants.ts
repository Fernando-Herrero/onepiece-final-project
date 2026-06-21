import { AVATAR_OPTIONS } from '@logpose/contracts/common/avatar.schemas';

import type {
  ProfilePostsEmptyMessageKey,
  ProfilePostsPrivateMessageKey,
  ProfilePostsTab,
  ProfilePostsTabConfig,
} from '@/features/profile/profile.types';

export const DEFAULT_AVATAR_SRC =
  AVATAR_OPTIONS.find(option => option.id === 'luffy')?.path ??
  '/avatars/luffy/luffy-happy-400.webp';

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

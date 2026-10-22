import type { ProfilePostsTab } from '@/features/profile/profile.types';

export const profileKeys = {
  all: ['profile'] as const,
  byId: (userId: string) => [...profileKeys.all, 'by-id', userId] as const,
  stats: (userId: string) => [...profileKeys.all, 'stats', userId] as const,
  ranking: () => [...profileKeys.all, 'ranking'] as const,
  followers: (userId: string) =>
    [...profileKeys.all, 'followers', userId] as const,
  following: (userId: string) =>
    [...profileKeys.all, 'following', userId] as const,
  postsTabs: () => [...profileKeys.all, 'posts-tab'] as const,
  postsTab: (userId: string, tab: ProfilePostsTab) =>
    [...profileKeys.postsTabs(), tab, userId] as const,
};

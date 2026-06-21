import type { ProfilePostsTab } from '@/features/profile/profile.types';

export const profileKeys = {
  all: ['profile'] as const,
  byId: (userId: string) => [...profileKeys.all, 'by-id', userId] as const,
  stats: (userId: string) => [...profileKeys.all, 'stats', userId] as const,
  ranking: () => [...profileKeys.all, 'ranking'] as const,
  postsTab: (userId: string, tab: ProfilePostsTab) =>
    [...profileKeys.all, 'posts-tab', tab, userId] as const,
};

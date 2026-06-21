import { queryOptions } from '@tanstack/react-query';

import { profileKeys } from '@/features/profile/api/profile.keys';
import type { ProfilePostsTab } from '@/features/profile/profile.types';
import type { OrpcClient } from '@/integrations/orpc/orpc.client';

export const getProfileQueriesOptions = (client: OrpcClient) => ({
  byId: (userId: string) =>
    queryOptions({
      queryKey: profileKeys.byId(userId),
      queryFn: () =>
        client.users.getById({
          params: { id: userId },
        }),
    }),

  stats: (userId: string) =>
    queryOptions({
      queryKey: profileKeys.stats(userId),
      queryFn: () =>
        client.users.getStats({
          params: { id: userId },
        }),
    }),

  ranking: () =>
    queryOptions({
      queryKey: profileKeys.ranking(),
      queryFn: () => client.users.ranking(),
    }),

  postsTab: (userId: string, tab: ProfilePostsTab) =>
    queryOptions({
      queryKey: profileKeys.postsTab(userId, tab),
      queryFn: () => {
        const input = { params: { id: userId } };

        switch (tab) {
          case 'posts':
            return client.users.getPosts(input);
          case 'liked':
            return client.users.getLikedPosts(input);
          case 'bookmarked':
            return client.users.getBookmarkedPosts(input);
          case 'comments':
            return client.users.getCommentedPosts(input);
        }
      },
    }),
});

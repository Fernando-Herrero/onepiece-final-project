import { queryOptions } from '@tanstack/react-query';

import type { OrpcClient } from '@/integrations/orpc/orpc.client';

import { profileKeys } from './profile.keys';

export const getProfileQueriesOptions = (client: OrpcClient) => ({
  stats: (userId: string) =>
    queryOptions({
      queryKey: profileKeys.stats(userId),
      queryFn: () => client.users.getStats({ params: { id: userId } }),
      enabled: userId.length > 0,
    }),
});

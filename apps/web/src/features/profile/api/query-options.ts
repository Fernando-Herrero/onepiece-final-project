import { queryOptions } from '@tanstack/react-query';

import { profileKeys } from '@/features/profile/api/profile.keys';
import type { OrpcClient } from '@/integrations/orpc/orpc.client';

export const getProfileQueriesOptions = (client: OrpcClient) => ({
  stats: (userId: string) =>
    queryOptions({
      queryKey: profileKeys.stats(userId),
      queryFn: () =>
        client.users.getStats({
          params: { id: userId },
        }),
    }),
});

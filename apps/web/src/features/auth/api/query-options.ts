import { queryOptions } from '@tanstack/react-query';

import { authKeys } from '@/features/auth/api/auth.keys';
import type { OrpcClient } from '@/integrations/orpc/orpc.client';

export const getAuthQueriesOptions = (client: OrpcClient) => ({
  me: () =>
    queryOptions({
      queryKey: authKeys.me(),
      queryFn: () => client.auth.me(),
      retry: false,
      staleTime: 60_000, // 1 min, no espamear el servidor con peticiones
    }),
});

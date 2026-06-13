import { queryOptions } from '@tanstack/react-query';

import { authKeys } from '@/features/auth/api/auth.keys';
import { client } from '@/integrations/orpc/orpc.client';

export const authQueryOptions = {
  me: () =>
    queryOptions({
      queryKey: authKeys.me(),
      queryFn: () => client.auth.me(),
    }),
};

export const usersQueryOptions = {
  list: () =>
    queryOptions({
      queryKey: ['users', 'list'] as const,
      queryFn: () => client.users.list(),
    }),
};

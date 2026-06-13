import { queryOptions } from '@tanstack/react-query';

import { usersKeys } from '@/features/users/api/users.keys';
import type { OrpcClient } from '@/integrations/orpc/orpc.client';

export const getUsersQueriesOptions = (client: OrpcClient) => ({
  list: () =>
    queryOptions({
      queryKey: usersKeys.list(),
      queryFn: () => client.users.list(),
    }),
});

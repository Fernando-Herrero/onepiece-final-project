import { useSuspenseQuery } from '@tanstack/react-query';

import { allQueriesOptions } from '@/integrations/tanstack-query/queries-options';

const usersRoomQueryOptions = allQueriesOptions.users;

export function useUsersListSuspenseQuery() {
  return useSuspenseQuery(usersRoomQueryOptions.list());
}

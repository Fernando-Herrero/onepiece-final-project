import { getAuthQueriesOptions } from '@/features/auth/api/query-options';
import { getUsersQueriesOptions } from '@/features/users/api/query-options';
import { client, type OrpcClient } from '@/integrations/orpc/orpc.client';

export const getAllQueriesOptions = (client: OrpcClient) => ({
  auth: getAuthQueriesOptions(client),
  users: getUsersQueriesOptions(client),
});

export const allQueriesOptions = getAllQueriesOptions(client);

import { getAuthQueriesOptions } from '@/features/auth/api/query-options';
import { getCardsQueriesOptions } from '@/features/cards/api/query-options';
import { getProfileQueriesOptions } from '@/features/profile/api/query-options';
import { getSerieQueriesOptions } from '@/features/serie/api/query-options';
import { client, type OrpcClient } from '@/integrations/orpc/orpc.client';

export const getAllQueriesOptions = (client: OrpcClient) => ({
  auth: getAuthQueriesOptions(client),
  serie: getSerieQueriesOptions(client),
  cards: getCardsQueriesOptions(client),
  profile: getProfileQueriesOptions(client),
});

export const allQueriesOptions = getAllQueriesOptions(client);

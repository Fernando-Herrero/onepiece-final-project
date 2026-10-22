import type { sessionUserSchema } from '@logpose/contracts/common/user.schemas';
import { type QueryClient, useQueryClient } from '@tanstack/react-query';
import type * as z from 'zod/v4';

import { allQueriesOptions } from '@/integrations/tanstack-query/queries-options';

export type SessionUser = z.infer<typeof sessionUserSchema>;

// `queryOptions` etiqueta la clave con lo que devuelve `auth.me`: leer o
// escribir otra forma en ella no compila.
const sessionUserKey = allQueriesOptions.auth.me().queryKey;

export function getSessionUser(queryClient: QueryClient) {
  return queryClient.getQueryData(sessionUserKey);
}

/** Guarda en la sesión el usuario que ya devuelve una mutación, sin refetch. */
export function useSessionUserWriter() {
  const queryClient = useQueryClient();

  return (user: SessionUser) => {
    queryClient.setQueryData(sessionUserKey, user);
  };
}

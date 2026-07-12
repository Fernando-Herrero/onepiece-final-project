/**
 * QueryClient global + hidratación desde GSSP.
 * El dashboard precarga `authKeys.me()` en `integrations/auth/server.ts`
 * y lo rehidrata aquí para evitar un fetch extra al montar.
 */
import {
  DehydratedState,
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { type PropsWithChildren, useMemo } from 'react';

export default function TanStackQueryProvider({
  children,
  dehydratedState,
}: PropsWithChildren<{ dehydratedState?: DehydratedState }>) {
  /** Una instancia por montaje de la app; `staleTime` evita refetch inmediato post-hidratación. */
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 10_000,
          },
        },
      }),
    [],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>{children}</HydrationBoundary>
    </QueryClientProvider>
  );
}

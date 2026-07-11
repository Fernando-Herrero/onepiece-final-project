import { queryOptions } from '@tanstack/react-query';

import { serieKeys } from '@/features/serie/api/serie.keys';
import type { OrpcClient } from '@/integrations/orpc/orpc.client';

export const getSerieQueriesOptions = (client: OrpcClient) => ({
  sagas: () =>
    queryOptions({
      queryKey: serieKeys.sagas(),
      queryFn: () => client.serie.listSagas(),
    }),

  arcsBySaga: (sagaId: number) =>
    queryOptions({
      queryKey: serieKeys.arcs(sagaId),
      queryFn: () => client.serie.listArcsBySaga({ params: { sagaId } }),
      enabled: sagaId > 0,
    }),

  episodesByArc: (arcId: number) =>
    queryOptions({
      queryKey: serieKeys.episodes(arcId),
      queryFn: () => client.serie.listEpisodesByArc({ params: { arcId } }),
      enabled: arcId > 0,
    }),
});

import { queryOptions } from '@tanstack/react-query';

import { serieKeys } from '@/features/serie/api/serie.keys';
import type { OrpcClient } from '@/integrations/orpc/orpc.client';

export const getSerieQueriesOptions = (client: OrpcClient) => ({
  sagas: () =>
    queryOptions({
      queryKey: serieKeys.sagas(),
      queryFn: () => client.serie.listSagas(),
    }),

  arcsBySaga: (sagaSlug: string) =>
    queryOptions({
      queryKey: serieKeys.arcs(sagaSlug),
      queryFn: () => client.serie.listArcsBySaga({ params: { sagaSlug } }),
    }),

  episodesByArc: (arcSlug: string) =>
    queryOptions({
      queryKey: serieKeys.episodes(arcSlug),
      queryFn: () => client.serie.listEpisodesByArc({ params: { arcSlug } }),
    }),
});

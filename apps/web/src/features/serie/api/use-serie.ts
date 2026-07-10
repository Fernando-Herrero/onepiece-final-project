import { useQuery, useSuspenseQuery } from '@tanstack/react-query';

import { allQueriesOptions } from '@/integrations/tanstack-query/queries-options';

type SerieQueryOptions = {
  enabled?: boolean;
};

export function useSuspenseSerieSagas() {
  return useSuspenseQuery(allQueriesOptions.serie.sagas());
}

export function useSerieSagas(options?: SerieQueryOptions) {
  return useQuery({
    ...allQueriesOptions.serie.sagas(),
    enabled: options?.enabled,
  });
}

export function useSerieArcs(sagaId: number, options?: SerieQueryOptions) {
  return useQuery({
    ...allQueriesOptions.serie.arcsBySaga(sagaId),
    enabled: options?.enabled ?? sagaId > 0,
  });
}

export function useSerieEpisodes(arcId: number, options?: SerieQueryOptions) {
  return useQuery({
    ...allQueriesOptions.serie.episodesByArc(arcId),
    enabled: options?.enabled ?? arcId > 0,
  });
}

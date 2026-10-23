export const serieKeys = {
  all: ['serie'] as const,
  sagas: () => [...serieKeys.all, 'sagas'] as const,
  arcs: (sagaSlug: string) => [...serieKeys.all, 'arcs', sagaSlug] as const,
  episodes: (arcSlug: string) =>
    [...serieKeys.all, 'episodes', arcSlug] as const,
};

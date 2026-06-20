export const serieKeys = {
  all: ['serie'] as const,
  sagas: () => [...serieKeys.all, 'sagas'] as const,
  arcs: (sagaId: number) => [...serieKeys.all, 'arcs', sagaId] as const,
  episodes: (arcId: number) => [...serieKeys.all, 'episodes', arcId] as const,
};

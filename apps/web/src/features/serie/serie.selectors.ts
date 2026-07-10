import { SERIE_TOTAL_XP } from '@/features/serie/serie.constants';
import type { SerieProgress } from '@/features/serie/serie.types';

export function isEpisodeWatched(
  episodeId: number,
  sagaId: number,
  arcId: number,
  progress: SerieProgress,
) {
  if (progress.saga === 0 && progress.arc === 0 && progress.episode === 0) {
    return false;
  }

  return (
    sagaId < progress.saga ||
    (sagaId === progress.saga && arcId < progress.arc) ||
    (sagaId === progress.saga &&
      arcId === progress.arc &&
      episodeId <= progress.episode)
  );
}

export function getSerieXpPercent(experience: number) {
  return Math.min(100, Math.round((experience / SERIE_TOTAL_XP) * 100));
}

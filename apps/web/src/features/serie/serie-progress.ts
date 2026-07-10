export type SerieProgress = {
  saga: number;
  arc: number;
  episode: number;
};

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

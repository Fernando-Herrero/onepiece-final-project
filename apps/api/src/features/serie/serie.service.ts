import { Injectable } from '@nestjs/common';
import { ORPCError } from '@orpc/server';

import {
  getArcBySlug,
  getArcsBySagaSlug,
  getEpisodeByNumber,
  getEpisodesByArcSlug,
  getSagaBySlug,
  getSagasData,
} from './serie-data.js';

@Injectable()
export class SerieService {
  listSagas() {
    const sagas = getSagasData();
    return { sagas, total: sagas.length };
  }

  listArcsBySaga(sagaSlug: string) {
    if (!getSagaBySlug(sagaSlug)) {
      throw new ORPCError('SAGA_NOT_FOUND');
    }

    const arcs = getArcsBySagaSlug(sagaSlug);
    return { sagaSlug, arcs, total: arcs.length };
  }

  listEpisodesByArc(arcSlug: string) {
    if (!getArcBySlug(arcSlug)) {
      throw new ORPCError('ARC_NOT_FOUND');
    }

    const episodes = getEpisodesByArcSlug(arcSlug);
    return { arcSlug, episodes, total: episodes.length };
  }

  getEpisode(episodeNumber: number) {
    const episode = getEpisodeByNumber(episodeNumber);

    if (!episode) {
      throw new ORPCError('EPISODE_NOT_FOUND');
    }

    return episode;
  }
}

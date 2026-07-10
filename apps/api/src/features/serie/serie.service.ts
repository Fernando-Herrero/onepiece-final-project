import { Injectable } from '@nestjs/common';
import { ORPCError } from '@orpc/server';

import {
  getArcById,
  getArcsBySagaId,
  getEpisodeById,
  getEpisodesByArcId,
  getSagaById,
  getSagasData,
} from './serie-data.js';

@Injectable()
export class SerieService {
  listSagas() {
    const sagas = getSagasData();
    return { sagas, total: sagas.length };
  }

  listArcsBySaga(sagaId: number) {
    if (!getSagaById(sagaId)) {
      throw new ORPCError('SAGA_NOT_FOUND');
    }

    const arcs = getArcsBySagaId(sagaId);
    return { sagaId, arcs, total: arcs.length };
  }

  listEpisodesByArc(arcId: number) {
    if (!getArcById(arcId)) {
      throw new ORPCError('ARC_NOT_FOUND');
    }

    const episodes = getEpisodesByArcId(arcId) ?? [];
    return { arcId, episodes, total: episodes.length };
  }

  getEpisode(episodeId: number) {
    const episode = getEpisodeById(episodeId);

    if (!episode) {
      throw new ORPCError('EPISODE_NOT_FOUND');
    }

    return episode;
  }
}

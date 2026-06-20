import { contract } from '@logpose/contracts/contract';
import { implement, ORPCError } from '@orpc/server';

import { type ApiContext } from '../../integrations/orpc/auth.middleware.js';
import {
  getArcById,
  getArcsBySagaId,
  getEpisodeById,
  getEpisodesByArcId,
  getSagaById,
  getSagasData,
} from './serie-data.js';

const os = implement(contract.serie).$context<ApiContext>();

const listSagas = os.listSagas.handler(async () => {
  const sagas = getSagasData();

  return {
    sagas,
    total: sagas.length,
  };
});

const listArcsBySaga = os.listArcsBySaga.handler(async ({ input }) => {
  const sagaId = input.params.sagaId;
  const saga = getSagaById(sagaId);

  if (!saga) {
    throw new ORPCError('SAGA_NOT_FOUND');
  }

  const arcs = getArcsBySagaId(sagaId);

  return {
    sagaId,
    arcs,
    total: arcs.length,
  };
});

const listEpisodesByArc = os.listEpisodesByArc.handler(async ({ input }) => {
  const arcId = input.params.arcId;
  const arc = getArcById(arcId);

  if (!arc) {
    throw new ORPCError('ARC_NOT_FOUND');
  }

  const episodes = getEpisodesByArcId(arcId) ?? [];

  return {
    arcId,
    episodes,
    total: episodes.length,
  };
});

const getEpisode = os.getEpisode.handler(async ({ input }) => {
  const episode = getEpisodeById(input.params.episodeId);

  if (!episode) {
    throw new ORPCError('EPISODE_NOT_FOUND');
  }

  return episode;
});

export const serieRouter = os.router({
  listSagas,
  listArcsBySaga,
  listEpisodesByArc,
  getEpisode,
});

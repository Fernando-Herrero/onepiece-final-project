import { oc } from '@orpc/contract';

import {
  arcListOutputSchema,
  episodeListOutputSchema,
  sagaListOutputSchema,
} from '../../common/serie.schemas.js';
import {
  arcIdParamsSchema,
  episodeIdParamsSchema,
  episodeOutputSchema,
  sagaIdParamsSchema,
} from './schemas.js';

export const serieErrors = {
  SAGA_NOT_FOUND: {
    status: 404,
    message: 'Saga not found',
  },
  ARC_NOT_FOUND: {
    status: 404,
    message: 'Arc not found',
  },
  EPISODE_NOT_FOUND: {
    status: 404,
    message: 'Episode not found',
  },
} as const;

export const serieContract = oc
  .tag('Serie')
  .prefix('/serie')
  .router({
    listSagas: oc
      .route({
        method: 'GET',
        path: '/sagas',
        description: 'List all sagas in chronological order',
      })
      .output(sagaListOutputSchema),

    listArcsBySaga: oc
      .route({
        method: 'GET',
        path: '/sagas/{sagaId}/arcs',
        inputStructure: 'detailed',
        description: 'List arcs for a saga',
      })
      .input(sagaIdParamsSchema)
      .errors(serieErrors)
      .output(arcListOutputSchema),

    listEpisodesByArc: oc
      .route({
        method: 'GET',
        path: '/arcs/{arcId}/episodes',
        inputStructure: 'detailed',
        description: 'List episodes for an arc',
      })
      .input(arcIdParamsSchema)
      .errors(serieErrors)
      .output(episodeListOutputSchema),

    getEpisode: oc
      .route({
        method: 'GET',
        path: '/episodes/{episodeId}',
        inputStructure: 'detailed',
        description: 'Get episode detail with rewards metadata',
      })
      .input(episodeIdParamsSchema)
      .errors(serieErrors)
      .output(episodeOutputSchema),
  });

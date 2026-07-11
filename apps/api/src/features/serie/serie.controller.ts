import {
  arcListOutputSchema,
  episodeListOutputSchema,
  sagaListOutputSchema,
} from '@logpose/contracts/common/serie.schemas';
import { episodeOutputSchema } from '@logpose/contracts/features/serie/schemas';
import { Controller } from '@nestjs/common';
import { Implement, implement } from '@orpc/nest';

import { throwContractOutputInvalid } from '../../integrations/orpc/contract-output-invalid.js';
import { contract } from '../../integrations/orpc/orpc.contract.js';
import { parseOrThrow } from '../../integrations/orpc/parse-or-throw.js';
import { Public } from '../auth/public.decorator.js';
import { handleSerieError } from './serie.errors.js';
import { SerieService } from './serie.service.js';

@Controller()
@Public()
export class SerieController {
  constructor(private readonly serieService: SerieService) {}

  @Implement(contract.serie.listSagas)
  listSagas() {
    return implement(contract.serie.listSagas).handler(async () =>
      parseOrThrow(
        sagaListOutputSchema,
        this.serieService.listSagas(),
        throwContractOutputInvalid,
      ),
    );
  }

  @Implement(contract.serie.listArcsBySaga)
  listArcsBySaga() {
    return implement(contract.serie.listArcsBySaga).handler(
      async ({ input, errors }) => {
        try {
          const result = this.serieService.listArcsBySaga(input.params.sagaId);

          return parseOrThrow(
            arcListOutputSchema,
            result,
            throwContractOutputInvalid,
          );
        } catch (error) {
          handleSerieError(error, errors);
        }
      },
    );
  }

  @Implement(contract.serie.listEpisodesByArc)
  listEpisodesByArc() {
    return implement(contract.serie.listEpisodesByArc).handler(
      async ({ input, errors }) => {
        try {
          const result = this.serieService.listEpisodesByArc(
            input.params.arcId,
          );

          return parseOrThrow(
            episodeListOutputSchema,
            result,
            throwContractOutputInvalid,
          );
        } catch (error) {
          handleSerieError(error, errors);
        }
      },
    );
  }

  @Implement(contract.serie.getEpisode)
  getEpisode() {
    return implement(contract.serie.getEpisode).handler(
      async ({ input, errors }) => {
        try {
          const episode = this.serieService.getEpisode(input.params.episodeId);

          return parseOrThrow(
            episodeOutputSchema,
            episode,
            throwContractOutputInvalid,
          );
        } catch (error) {
          handleSerieError(error, errors);
        }
      },
    );
  }
}

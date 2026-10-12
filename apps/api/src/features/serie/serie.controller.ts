import { Controller } from '@nestjs/common';
import { Implement, implement } from '@orpc/nest';

import { contract } from '../../integrations/orpc/orpc.contract.js';
import { Public } from '../auth/public.decorator.js';
import { SerieService } from './serie.service.js';

@Controller()
@Public()
export class SerieController {
  constructor(private readonly serieService: SerieService) {}

  @Implement(contract.serie.listSagas)
  listSagas() {
    return implement(contract.serie.listSagas).handler(() =>
      this.serieService.listSagas(),
    );
  }

  @Implement(contract.serie.listArcsBySaga)
  listArcsBySaga() {
    return implement(contract.serie.listArcsBySaga).handler(({ input }) =>
      this.serieService.listArcsBySaga(input.params.sagaId),
    );
  }

  @Implement(contract.serie.listEpisodesByArc)
  listEpisodesByArc() {
    return implement(contract.serie.listEpisodesByArc).handler(({ input }) =>
      this.serieService.listEpisodesByArc(input.params.arcId),
    );
  }

  @Implement(contract.serie.getEpisode)
  getEpisode() {
    return implement(contract.serie.getEpisode).handler(({ input }) =>
      this.serieService.getEpisode(input.params.episodeId),
    );
  }
}

import { Module } from '@nestjs/common';

import { SerieController } from './serie.controller.js';
import { SerieService } from './serie.service.js';

@Module({
  controllers: [SerieController],
  providers: [SerieService],
})
export class SerieModule {}

import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

import { MongoHealthIndicator } from './mongo-health.indicator.js';

@Controller('api/health')
export class ReadinessController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly mongo: MongoHealthIndicator,
  ) {}

  @Get('ready')
  @HealthCheck()
  ready() {
    return this.health.check([() => this.mongo.isHealthy('mongodb')]);
  }
}

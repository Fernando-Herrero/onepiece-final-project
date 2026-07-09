import { Controller } from '@nestjs/common';
import { Implement, implement } from '@orpc/nest';

import { contract } from '../../integrations/orpc/orpc.contract.js';

@Controller()
export class HealthController {
  @Implement(contract.health.check)
  check() {
    return implement(contract.health.check).handler(async () => ({
      status: 'ok' as const,
      service: '@logpose/api',
    }));
  }
}
import { Controller } from '@nestjs/common';
import { Implement, implement } from '@orpc/nest';

import { contract } from '../../integrations/orpc/orpc.contract.js';
import { Public } from '../auth/public.decorator.js';

@Controller()
@Public()
export class HealthController {
  @Implement(contract.health.check)
  check() {
    return implement(contract.health.check).handler(async () => ({
      status: 'ok' as const,
      service: '@logpose/api',
    }));
  }
}

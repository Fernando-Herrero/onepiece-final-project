import { healthOutputSchema } from '@logpose/contracts/features/health/contract';
import { Controller } from '@nestjs/common';
import { Implement, implement } from '@orpc/nest';

import { throwContractOutputInvalid } from '../../integrations/orpc/contract-output-invalid.js';
import { contract } from '../../integrations/orpc/orpc.contract.js';
import { parseOrThrow } from '../../integrations/orpc/parse-or-throw.js';

@Controller()
export class HealthController {
  @Implement(contract.health.check)
  check() {
    return implement(contract.health.check).handler(async () =>
      parseOrThrow(
        healthOutputSchema,
        { status: 'ok' as const, service: '@logpose/api' },
        throwContractOutputInvalid,
      ),
    );
  }
}

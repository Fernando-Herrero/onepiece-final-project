import { contract } from '@logpose/contracts/contract';
import { implement } from '@orpc/server';

import { ApiContext } from '../../integrations/orpc/auth.middleware.js';

const os = implement(contract.health).$context<ApiContext>();

const check = os.check.handler(async () => ({
  status: 'ok' as const,
  service: '@logpose/api',
}));

export const healthRouter = os.router({
  check,
});

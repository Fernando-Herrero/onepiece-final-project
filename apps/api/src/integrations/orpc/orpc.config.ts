import { REQUEST } from '@nestjs/core';
import { onError, type ORPCModuleConfig } from '@orpc/nest';
import type { Request } from 'express';

import { contractErrorsInterceptor } from './contract-errors.interceptor.js';
import { logOrpcError } from './orpc-error-logger.js';

/** Config de `ORPCModule.forRootAsync`, compartida por la app y sus tests de integración. */
export const orpcModuleOptions = {
  useFactory: (request: Request): ORPCModuleConfig => ({
    context: { request },
    interceptors: [onError(logOrpcError), contractErrorsInterceptor],
  }),
  inject: [REQUEST],
};

import { REQUEST } from '@nestjs/core';
import {
  onError,
  type ORPCGlobalContext,
  type ORPCModuleConfig,
} from '@orpc/nest';

import { contractErrorsInterceptor } from './contract-errors.interceptor.js';
import { logOrpcError } from './orpc-error-logger.js';

/** Config de `ORPCModule.forRootAsync`, compartida por la app y sus tests de integración. */
export const orpcModuleOptions = {
  // `viewer` lo asigna SessionGuard en esta misma request antes del handler.
  useFactory: (request: ORPCGlobalContext['request']): ORPCModuleConfig => ({
    context: { request },
    interceptors: [onError(logOrpcError), contractErrorsInterceptor],
  }),
  inject: [REQUEST],
};

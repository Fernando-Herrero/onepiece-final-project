import type { IncomingHttpHeaders } from 'node:http';

import { OpenAPIHandler } from '@orpc/openapi/node';
import { onError } from '@orpc/server';
import { ZodSmartCoercionPlugin } from '@orpc/zod';

import { apiRouter } from '../../features/auth/auth.router.js';

export const orpcHandler = new OpenAPIHandler(apiRouter, {
  plugins: [new ZodSmartCoercionPlugin()],
  interceptors: [onError(error => console.error(error))],
});

export function createOrpcContext(headers: IncomingHttpHeaders) {
  return { headers };
}

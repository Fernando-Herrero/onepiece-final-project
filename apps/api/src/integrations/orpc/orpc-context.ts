import { ORPCError } from '@orpc/server';
import type { Request } from 'express';

import type { UserViewer, Viewer } from '../../features/auth/access.js';

declare module '@orpc/nest' {
  interface ORPCGlobalContext {
    request: Request & { viewer: Viewer };
  }
}

/**
 * Viewer con sesión en un handler protegido por SessionGuard.
 * Lanza UNAUTHORIZED si se llama en una ruta sin sesión: señal de que le
 * falta el guard o le sobra @Public() en esa ruta.
 */
export function requireViewer(
  request: Request & { viewer: Viewer },
): UserViewer {
  if (request.viewer.kind === 'anonymous') {
    throw new ORPCError('UNAUTHORIZED');
  }

  return request.viewer;
}

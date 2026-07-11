import { ORPCError } from '@orpc/server';
import type { Request } from 'express';

/** Usuario de sesión — solo el id del JWT (`sub`). Rol y perfil vienen de Mongo en cada handler. */
export type SessionUser = {
  id: string;
};

declare module '@orpc/nest' {
  interface ORPCGlobalContext {
    request: Request & { user?: SessionUser };
  }
}

/**
 * Usuario de la request en un handler protegido por SessionGuard.
 * Lanza UNAUTHORIZED si se llama en una ruta sin usuario — señal de que le
 * falta el guard o le sobra @Public() en esa ruta.
 */
export function requireUser(
  request: Request & { user?: SessionUser },
): SessionUser {
  if (!request.user) {
    throw new ORPCError('UNAUTHORIZED');
  }

  return request.user;
}

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

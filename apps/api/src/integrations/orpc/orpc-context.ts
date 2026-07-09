import type { Request } from 'express';

export type AuthPayload = {
  id: string;
  email: string;
  role: 'user' | 'admin';
};

declare module '@orpc/nest' {
  interface ORPCGlobalContext {
    // JWT opcional: anónimo si no hay token o es inválido (mismo comportamiento que optionalAuth).
    request: Request & { user?: AuthPayload };
  }
}

import { commonErrors } from '@logpose/contracts/common/errors';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ORPCError } from '@orpc/server';
import type { Request } from 'express';

import { UsersPersistence } from '../users/users.persistence.js';
import type { Viewer } from './access.js';
import { AuthSessionService } from './auth-session.service.js';
import { IS_PUBLIC_KEY } from './public.decorator.js';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authSession: AuthSessionService,
    private readonly usersPersistence: UsersPersistence,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context
      .switchToHttp()
      .getRequest<Request & { viewer: Viewer }>();

    request.viewer = await this.resolveViewer(request);

    if (isPublic || request.viewer.kind === 'user') {
      return true;
    }

    // Fuera de oRPC no hay `errors`: se crea el definido a mano (lo declara el contrato raíz).
    throw new ORPCError('UNAUTHORIZED', {
      defined: true,
      ...commonErrors.UNAUTHORIZED,
    });
  }

  /** Rol leído de Mongo en cada petición (ADR 0004); sin cuenta, anónimo. */
  private async resolveViewer(request: Request): Promise<Viewer> {
    const id = this.authSession.getUserId(request.headers);
    const role = id ? await this.usersPersistence.findRoleById(id) : null;

    return id && role ? { kind: 'user', id, role } : { kind: 'anonymous' };
  }
}

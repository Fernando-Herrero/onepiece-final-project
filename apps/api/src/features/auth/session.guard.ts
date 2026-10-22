import { commonErrors } from '@logpose/contracts/common/errors';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ORPCError } from '@orpc/server';
import type { Request, Response } from 'express';

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

    const http = context.switchToHttp();
    const request = http.getRequest<Request & { viewer: Viewer }>();

    request.viewer = await this.resolveViewer(
      request,
      http.getResponse<Response>(),
    );

    if (isPublic || request.viewer.kind === 'user') {
      return true;
    }

    // Fuera de oRPC no hay `errors`: se crea el definido a mano (lo declara el contrato raíz).
    throw new ORPCError('UNAUTHORIZED', {
      defined: true,
      ...commonErrors.UNAUTHORIZED,
    });
  }

  /** Rol y estado leídos de Mongo en cada petición (ADR 0004); sin sesión o con la cuenta desactivada o borrada, anónimo. */
  private async resolveViewer(
    request: Request,
    response: Response,
  ): Promise<Viewer> {
    const id = await this.authSession.resolve(request, response);
    const access = id ? await this.usersPersistence.findAccessById(id) : null;

    return id && access?.isActive
      ? { kind: 'user', id, role: access.role }
      : { kind: 'anonymous' };
  }
}

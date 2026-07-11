import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ORPCError } from '@orpc/server';
import type { Request } from 'express';

import type { SessionUser } from '../../integrations/orpc/orpc-context.js';
import { AuthSessionService } from './auth-session.service.js';
import { IS_PUBLIC_KEY } from './public.decorator.js';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authSession: AuthSessionService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: SessionUser }>();

    const user = this.authSession.getOptionalUser(request.headers);

    if (user) {
      request.user = user;
    }

    if (isPublic) {
      return true;
    }

    if (!user) {
      throw new ORPCError('UNAUTHORIZED');
    }

    return true;
  }
}

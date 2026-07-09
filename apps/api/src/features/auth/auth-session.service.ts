import type { IncomingHttpHeaders } from 'node:http';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ORPCError } from '@orpc/server';
import type { Request } from 'express';
import jwt from 'jsonwebtoken';

import type { ServerEnv } from '../../integrations/env/server.js';
import type { AuthPayload } from '../../integrations/orpc/orpc-context.js';
import { getSessionTokenFromCookieHeader } from './auth.cookies.js';

@Injectable()
export class AuthSessionService {
  constructor(private readonly config: ConfigService<ServerEnv, true>) {}

  private get jwtSecret(): string {
    return this.config.getOrThrow('JWT_SECRET', { infer: true });
  }

  getOptionalUser(headers: IncomingHttpHeaders): AuthPayload | undefined {
    const bearer = headers.authorization?.split(' ')[1];
    const cookieToken = getSessionTokenFromCookieHeader(headers.cookie);
    const token = bearer ?? cookieToken;

    if (!token) {
      return undefined;
    }

    try {
      return jwt.verify(token, this.jwtSecret) as AuthPayload;
    } catch {
      return undefined;
    }
  }

  getRequiredUser(headers: IncomingHttpHeaders): AuthPayload {
    const user = this.getOptionalUser(headers);

    if (!user) {
      throw new ORPCError('UNAUTHORIZED');
    }

    return user;
  }

  attachUserToRequest(request: Request): Request & { user?: AuthPayload } {
    const user = this.getOptionalUser(request.headers);
    return Object.assign(request, { user });
  }

  assertOwnerOrAdmin(
    ownerId: string,
    viewer?: { id: string; role: 'user' | 'admin' },
  ) {
    if (!viewer) {
      throw new ORPCError('UNAUTHORIZED');
    }

    if (ownerId !== viewer.id && viewer.role !== 'admin') {
      throw new ORPCError('FORBIDDEN');
    }
  }

  requireAdmin(viewer?: AuthPayload) {
    if (!viewer) {
      throw new ORPCError('UNAUTHORIZED');
    }

    if (viewer.role !== 'admin') {
      throw new ORPCError('FORBIDDEN');
    }
  }

  signToken(payload: AuthPayload): string {
    return jwt.sign(payload, this.jwtSecret, { expiresIn: '2h' });
  }
}

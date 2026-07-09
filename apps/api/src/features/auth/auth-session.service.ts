import type { IncomingHttpHeaders } from 'node:http';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ORPCError } from '@orpc/server';
import type { Request } from 'express';
import jwt from 'jsonwebtoken';

import type { ServerEnv } from '../../integrations/env/server.js';
import type { SessionUser } from '../../integrations/orpc/orpc-context.js';
import { getSessionTokenFromCookieHeader } from './auth.cookies.js';

@Injectable()
export class AuthSessionService {
  constructor(private readonly config: ConfigService<ServerEnv, true>) {}

  private get jwtSecret(): string {
    return this.config.getOrThrow('JWT_SECRET', { infer: true });
  }

  getOptionalUser(headers: IncomingHttpHeaders): SessionUser | undefined {
    const bearer = headers.authorization?.split(' ')[1];
    const token = bearer ?? getSessionTokenFromCookieHeader(headers.cookie);

    if (!token) {
      return undefined;
    }

    try {
      const payload = jwt.verify(token, this.jwtSecret);

      if (
        typeof payload !== 'object' ||
        payload === null ||
        !('sub' in payload) ||
        typeof payload.sub !== 'string' ||
        !payload.sub
      ) {
        return undefined;
      }

      return { id: payload.sub };
    } catch {
      return undefined;
    }
  }

  requireUser(request: Request & { user?: SessionUser }): SessionUser {
    const user = request.user ?? this.getOptionalUser(request.headers);

    if (!user) {
      throw new ORPCError('UNAUTHORIZED');
    }

    return user;
  }

  attachUserToRequest(request: Request): Request & { user?: SessionUser } {
    return Object.assign(request, {
      user: this.getOptionalUser(request.headers),
    });
  }

  signToken(userId: string): string {
    return jwt.sign({ sub: userId }, this.jwtSecret, { expiresIn: '2h' });
  }
}

import type { IncomingHttpHeaders } from 'node:http';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';

import type { ServerEnv } from '../../integrations/env/server.js';
import {
  getSessionTokenFromCookieHeader,
  SESSION_MAX_AGE_SEC,
} from './auth.cookies.js';

@Injectable()
export class AuthSessionService {
  constructor(private readonly config: ConfigService<ServerEnv, true>) {}

  private get jwtSecret(): string {
    return this.config.getOrThrow('JWT_SECRET', { infer: true });
  }

  getUserId(headers: IncomingHttpHeaders): string | undefined {
    const token = getSessionTokenFromCookieHeader(headers.cookie);

    if (!token) {
      return undefined;
    }

    try {
      const payload = jwt.verify(token, this.jwtSecret);

      if (typeof payload === 'string') {
        return undefined;
      }

      const sub = payload.sub;
      if (typeof sub !== 'string' || !sub) {
        return undefined;
      }

      return sub;
    } catch {
      return undefined;
    }
  }

  signToken(userId: string): string {
    return jwt.sign({ sub: userId }, this.jwtSecret, {
      expiresIn: SESSION_MAX_AGE_SEC,
    });
  }
}

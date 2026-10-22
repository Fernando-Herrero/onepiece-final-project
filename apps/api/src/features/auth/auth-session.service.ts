import { createHash, randomBytes } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import type { Request, Response } from 'express';

import {
  clearSessionCookie,
  getSessionTokenFromCookieHeader,
  SESSION_MAX_AGE_MS,
  setSessionCookie,
} from './auth.cookies.js';
import { SessionsPersistence } from './sessions.persistence.js';

/** Renovar como mucho una vez al día evita escribir en Mongo en cada petición. */
const RENEW_AFTER_MS = 24 * 60 * 60 * 1000;

const hashToken = (token: string) =>
  createHash('sha256').update(token).digest('hex');

const expiresFromNow = () => new Date(Date.now() + SESSION_MAX_AGE_MS);

@Injectable()
export class AuthSessionService {
  constructor(private readonly sessions: SessionsPersistence) {}

  async open(userId: string, res: Response) {
    const token = randomBytes(32).toString('base64url');

    await this.sessions.insert(hashToken(token), userId, expiresFromNow());
    setSessionCookie(res, token);
  }

  /** Id del usuario de la cookie, o `undefined` si no hay sesión activa. */
  async resolve(req: Request, res: Response): Promise<string | undefined> {
    const token = getSessionTokenFromCookieHeader(req.headers.cookie);
    if (!token) {
      return undefined;
    }

    const id = hashToken(token);
    const session = await this.sessions.findActive(id);
    if (!session) {
      return undefined;
    }

    if (Date.now() - session.lastSeenAt.getTime() > RENEW_AFTER_MS) {
      await this.sessions.renew(id, expiresFromNow());
      setSessionCookie(res, token);
    }

    return session.userId.toString();
  }

  async close(req: Request, res: Response) {
    const token = getSessionTokenFromCookieHeader(req.headers.cookie);
    if (token) {
      await this.sessions.delete(hashToken(token));
    }
    clearSessionCookie(res);
  }

  /** Cierra todas las sesiones del usuario y abre una nueva en esta respuesta. */
  async rotate(userId: string, res: Response) {
    await this.sessions.deleteByUser(userId);
    await this.open(userId, res);
  }
}

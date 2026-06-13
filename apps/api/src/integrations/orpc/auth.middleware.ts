import type { IncomingHttpHeaders } from 'node:http';

import { ORPCError, os } from '@orpc/server';
import jwt from 'jsonwebtoken';

import { env } from '../../config/env.js';

export type AuthPayload = {
  id: string;
  email: string;
  role: 'user' | 'admin';
};

export type ApiContext = {
  headers: IncomingHttpHeaders;
  user?: AuthPayload;
};

export function getOptionalAuthUser(
  headers: IncomingHttpHeaders,
): AuthPayload | undefined {
  const token = headers.authorization?.split(' ')[1];
  if (!token) {
    return undefined;
  }

  try {
    return jwt.verify(token, env.jwtSecret) as AuthPayload;
  } catch {
    return undefined;
  }
}

export function getRequiredAuthUser(headers: IncomingHttpHeaders): AuthPayload {
  const user = getOptionalAuthUser(headers);

  if (!user) {
    throw new ORPCError('UNAUTHORIZED');
  }

  return user;
}

const base = os.$context<ApiContext>();

export const requireAuth = base.middleware(async ({ context, next }) => {
  const user = getRequiredAuthUser(context.headers);
  return next({ context: { ...context, user } });
});

export const optionalAuth = base.middleware(async ({ context, next }) => {
  const user = getOptionalAuthUser(context.headers);
  return next({ context: { ...context, user } });
});

export function assertOwnerOrAdmin(
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

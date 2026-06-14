import type { IncomingHttpHeaders } from 'node:http';

import { OpenAPIHandler } from '@orpc/openapi/node';
import { onError } from '@orpc/server';
import { ZodSmartCoercionPlugin } from '@orpc/zod';

import { authRouter } from '../../features/auth/auth.router.js';
import { cardsRouter } from '../../features/cards/cards.router.js';
import { commentsRouter } from '../../features/comments/comments.router.js';
import { healthRouter } from '../../features/health/health.router.js';
import { notificationsRouter } from '../../features/notifications/notifications.router.js';
import { postsRouter } from '../../features/posts/posts.router.js';
import { progressRouter } from '../../features/progress/progress.router.js';
import { usersRouter } from '../../features/users/users.router.js';

export const apiRouter = {
  health: healthRouter,
  auth: authRouter,
  users: usersRouter,
  posts: postsRouter,
  comments: commentsRouter,
  progress: progressRouter,
  cards: cardsRouter,
  notifications: notificationsRouter,
};

export const orpcHandler = new OpenAPIHandler(apiRouter, {
  plugins: [new ZodSmartCoercionPlugin()],
  interceptors: [onError(error => console.error('[orpc]', error))],
});

export function createOrpcContext(headers: IncomingHttpHeaders) {
  return { headers };
}

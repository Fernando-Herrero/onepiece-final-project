import type { IncomingHttpHeaders } from 'node:http';

import { OpenAPIHandler } from '@orpc/openapi/node';
import { onError } from '@orpc/server';
import { ZodSmartCoercionPlugin } from '@orpc/zod';

import { authRouter } from '../../features/auth/auth.router.js';
import { commentsRouter } from '../../features/comments/comments.router.js';
import { postsRouter } from '../../features/posts/posts.router.js';
import { usersRouter } from '../../features/users/users.router.js';

export const apiRouter = {
  auth: authRouter,
  users: usersRouter,
  posts: postsRouter,
  comments: commentsRouter,
};

export const orpcHandler = new OpenAPIHandler(apiRouter, {
  plugins: [new ZodSmartCoercionPlugin()],
  interceptors: [onError(error => console.error(error))],
});

export function createOrpcContext(headers: IncomingHttpHeaders) {
  return { headers };
}

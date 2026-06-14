import cors from 'cors';
import express from 'express';

import { connectDb } from './config/db.js';
import { env } from './integrations/env/server.js';
import { serveOpenApiSpec, serveSwaggerUi } from './integrations/orpc/docs.js';
import { createOrpcContext, orpcHandler } from './integrations/orpc/handler.js';

await connectDb();

const app = express();

// Reverse proxy (Vercel, nginx): req.protocol respects X-Forwarded-Proto in OpenAPI spec
app.set('trust proxy', 1);

app.use(cors());

// Docs OpenAPI — rutas Express normales, NO oRPC
app.get('/api/orpc/spec.json', serveOpenApiSpec);
app.get('/api/orpc', serveSwaggerUi);

// Procedimientos oRPC (health, auth, posts…)
app.use('/api', async (req, res, next) => {
  const { matched } = await orpcHandler.handle(req, res, {
    context: createOrpcContext(req.headers),
  });

  if (matched) {
    return;
  }

  next();
});

app.use((_req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`LogPose API listening on http://localhost:${env.port}`);
  // eslint-disable-next-line no-console
  console.log(`LogPose API swagger  http://localhost:${env.port}/api/orpc`);
  // eslint-disable-next-line no-console
  console.log(
    `LogPose API spec     http://localhost:${env.port}/api/orpc/spec.json`,
  );
});

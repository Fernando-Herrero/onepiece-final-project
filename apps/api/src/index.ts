import cors from 'cors';
import express from 'express';

import { connectDb } from './config/db.js';
import { env } from './config/env.js';
import { createOrpcContext, orpcHandler } from './integrations/orpc/handler.js';

await connectDb();

const app = express();

app.use(cors());

app.get('/api', (_req, res) => {
  res.json({ ok: true, message: 'LogPose API running' });
});

app.use('/api', async (req, res, next) => {
  const { matched } = await orpcHandler.handle(req, res, {
    prefix: '/api',
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
  console.warn(`LogPose API listening on http://localhost:${env.port}`);
});

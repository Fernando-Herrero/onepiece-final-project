import mongoose from 'mongoose';

import { env } from '../integrations/env/server.js';

export async function connectDb() {
  const db = await mongoose.connect(env.mongodbUri);
  const { name, host } = db.connection;
  // eslint-disable-next-line no-console
  console.log(`DB connected: ${name} on ${host}`);
}

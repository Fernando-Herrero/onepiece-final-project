import mongoose from 'mongoose';

import { env } from './env.js';

export async function connectDb() {
  const db = await mongoose.connect(env.mongodbUri);
  const { name, host } = db.connection;
  console.log(`DB connected: ${name} on ${host}`);
}

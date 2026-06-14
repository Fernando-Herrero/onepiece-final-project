import 'dotenv/config';

import * as z from 'zod/v4';

const serverEnvSchema = z
  .object({
    PORT: z.coerce.number().default(4000),
    MONGODB_URI: z.string(),
    JWT_SECRET: z.string(),
  })
  .loose(); // 'mantiene cualquier variable extra'

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function validateEnv(config: Record<string, unknown>): ServerEnv {
  return serverEnvSchema.parse(config);
}

const parsed = validateEnv(process.env);

export const env = {
  port: parsed.PORT,
  mongodbUri: parsed.MONGODB_URI,
  jwtSecret: parsed.JWT_SECRET,
} as const;

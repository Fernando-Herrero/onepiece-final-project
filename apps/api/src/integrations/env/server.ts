import * as z from 'zod/v4';

const serverEnvSchema = z
  .object({
    PORT: z.coerce.number().min(1),
    NODE_ENV: z.enum(['development', 'production']).default('development'),
    MONGODB_URI: z.string().min(1),
    MONGODB_DBNAME: z.string().min(1),
    JWT_SECRET: z.string().min(1),
  })
  .loose();

export type ServerEnv = z.infer<typeof serverEnvSchema>;

/**
 * Hook `validate` de ConfigModule.forRoot — Nest pasa env files + process.env.
 * @see https://docs.nestjs.com/techniques/configuration#custom-validate-function
 */
export function validateEnv(config: Record<string, unknown>): ServerEnv {
  return serverEnvSchema.parse(config);
}

import type { ZodType } from 'zod/v4';

export function parseOrThrow<T>(
  schema: ZodType<T>,
  data: unknown,
  throwInvalid: (issues: string[]) => never,
): T {
  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    throwInvalid(
      parsed.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`),
    );
  }

  return parsed.data;
}

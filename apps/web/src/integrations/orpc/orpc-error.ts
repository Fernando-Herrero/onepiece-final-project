import { type InferClientErrorUnion, isDefinedError } from '@orpc/client';

import { client } from '@/integrations/orpc/orpc.client';

type OrpcClientError = InferClientErrorUnion<typeof client>;

const KNOWN_USER_MUTATION_CODES = [
  'ALREADY_FOLLOWING',
  'NOT_FOLLOWING',
  'CANNOT_FOLLOW_SELF',
  'PRIVACY_DENIED',
  'FORBIDDEN',
] as const;

export type KnownUserMutationCode = (typeof KNOWN_USER_MUTATION_CODES)[number];

export function getOrpcErrorCode(error: unknown): string | undefined {
  const typedError = error as OrpcClientError;

  if (!isDefinedError(typedError)) {
    return undefined;
  }

  return typedError.code;
}

export function isKnownUserMutationError(
  error: unknown,
): error is { code: KnownUserMutationCode } {
  const code = getOrpcErrorCode(error);

  return (
    code !== undefined &&
    (KNOWN_USER_MUTATION_CODES as readonly string[]).includes(code)
  );
}

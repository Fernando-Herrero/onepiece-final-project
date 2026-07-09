const KNOWN_USER_MUTATION_CODES = [
  'ALREADY_FOLLOWING',
  'NOT_FOLLOWING',
  'CANNOT_FOLLOW_SELF',
  'PRIVACY_DENIED',
  'FORBIDDEN',
] as const;

export type KnownUserMutationCode = (typeof KNOWN_USER_MUTATION_CODES)[number];

export function getOrpcErrorCode(error: unknown): string | undefined {
  if (typeof error !== 'object' || error === null || !('code' in error)) {
    return undefined;
  }

  const { code } = error as { code: unknown };

  return typeof code === 'string' ? code : undefined;
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

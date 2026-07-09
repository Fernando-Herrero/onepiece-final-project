function isMongoDuplicateKey(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 11000
  );
}

type RegisterErrors = {
  DUPLICATE_ACCOUNT: (...args: never[]) => unknown;
};

export function handleRegisterError(error: unknown, errors: RegisterErrors): never {
  if (isMongoDuplicateKey(error)) {
    throw errors.DUPLICATE_ACCOUNT();
  }

  throw error;
}

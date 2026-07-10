import { ORPCError } from '@orpc/server';

function isMongoDuplicateKey(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 11000
  );
}

type AuthContractErrors = {
  INVALID_CREDENTIALS: (...args: never[]) => unknown;
  UNAUTHORIZED: (...args: never[]) => unknown;
  ACCOUNT_INACTIVE: (...args: never[]) => unknown;
  USER_NOT_FOUND: (...args: never[]) => unknown;
  INVALID_CURRENT_PASSWORD: (...args: never[]) => unknown;
  DUPLICATE_ACCOUNT: (...args: never[]) => unknown;
};

const AUTH_ERROR_CODES = [
  'INVALID_CREDENTIALS',
  'UNAUTHORIZED',
  'ACCOUNT_INACTIVE',
  'USER_NOT_FOUND',
  'INVALID_CURRENT_PASSWORD',
] as const satisfies readonly (keyof AuthContractErrors)[];

type AuthErrorCode = (typeof AUTH_ERROR_CODES)[number];

function isAuthErrorCode(code: string): code is AuthErrorCode {
  return (AUTH_ERROR_CODES as readonly string[]).includes(code);
}

export function handleAuthError(
  error: unknown,
  errors: AuthContractErrors,
): never {
  if (isMongoDuplicateKey(error)) {
    throw errors.DUPLICATE_ACCOUNT();
  }

  if (error instanceof ORPCError && isAuthErrorCode(error.code)) {
    throw errors[error.code]();
  }

  throw error;
}

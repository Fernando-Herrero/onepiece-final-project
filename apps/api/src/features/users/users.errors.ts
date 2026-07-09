import { ORPCError } from '@orpc/server';

type UsersContractErrors = {
  UNAUTHORIZED: (...args: never[]) => unknown;
  FORBIDDEN: (...args: never[]) => unknown;
  USER_NOT_FOUND: (...args: never[]) => unknown;
  PRIVACY_DENIED: (...args: never[]) => unknown;
  CANNOT_FOLLOW_SELF: (...args: never[]) => unknown;
  ALREADY_FOLLOWING: (...args: never[]) => unknown;
  NOT_FOLLOWING: (...args: never[]) => unknown;
};

const USERS_ERROR_CODES = [
  'UNAUTHORIZED',
  'FORBIDDEN',
  'USER_NOT_FOUND',
  'PRIVACY_DENIED',
  'CANNOT_FOLLOW_SELF',
  'ALREADY_FOLLOWING',
  'NOT_FOLLOWING',
] as const satisfies readonly (keyof UsersContractErrors)[];

type UsersErrorCode = (typeof USERS_ERROR_CODES)[number];

function isUsersErrorCode(code: string): code is UsersErrorCode {
  return (USERS_ERROR_CODES as readonly string[]).includes(code);
}

export function handleUsersError(
  error: unknown,
  errors: UsersContractErrors,
): never {
  if (error instanceof ORPCError && isUsersErrorCode(error.code)) {
    throw errors[error.code]();
  }

  throw error;
}

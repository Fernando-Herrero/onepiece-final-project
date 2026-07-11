import { ORPCError } from '@orpc/server';

export type ContractErrorHandlers<T> = {
  [K in keyof T]: (...args: never[]) => unknown;
};

export function handleContractError<C extends string>(
  error: unknown,
  codes: readonly C[],
  errors: Record<C, (...args: never[]) => unknown>,
): never {
  if (
    error instanceof ORPCError &&
    (codes as readonly string[]).includes(error.code)
  ) {
    throw errors[error.code as C]();
  }

  throw error;
}

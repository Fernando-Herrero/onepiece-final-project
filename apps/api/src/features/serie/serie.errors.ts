import { ORPCError } from '@orpc/server';

type SerieContractErrors = {
  SAGA_NOT_FOUND: (...args: never[]) => unknown;
  ARC_NOT_FOUND: (...args: never[]) => unknown;
  EPISODE_NOT_FOUND: (...args: never[]) => unknown;
};

const SERIE_ERROR_CODES = [
  'SAGA_NOT_FOUND',
  'ARC_NOT_FOUND',
  'EPISODE_NOT_FOUND',
] as const satisfies readonly (keyof SerieContractErrors)[];

type SerieErrorCode = (typeof SERIE_ERROR_CODES)[number];

function isSerieErrorCode(code: string): code is SerieErrorCode {
  return (SERIE_ERROR_CODES as readonly string[]).includes(code);
}

export function handleSerieError(
  error: unknown,
  errors: SerieContractErrors,
): never {
  if (error instanceof ORPCError && isSerieErrorCode(error.code)) {
    throw errors[error.code]();
  }

  throw error;
}

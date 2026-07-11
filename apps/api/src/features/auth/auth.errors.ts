import { authErrors } from '@logpose/contracts/features/auth/contract';

import {
  type ContractErrorHandlers,
  handleContractError,
} from '../../integrations/orpc/handle-contract-error.js';

const AUTH_ERROR_CODES = [
  'INVALID_CREDENTIALS',
  'UNAUTHORIZED',
  'ACCOUNT_INACTIVE',
  'USER_NOT_FOUND',
  'INVALID_CURRENT_PASSWORD',
] as const satisfies readonly (keyof typeof authErrors)[];

export function handleAuthError(
  error: unknown,
  errors: ContractErrorHandlers<typeof authErrors>,
): never {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 11000
  ) {
    throw errors.DUPLICATE_ACCOUNT();
  }

  handleContractError(error, AUTH_ERROR_CODES, errors);
}

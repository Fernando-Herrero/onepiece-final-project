import { usersErrors } from '@logpose/contracts/features/users/contract';

import {
  type ContractErrorHandlers,
  handleContractError,
} from '../../integrations/orpc/handle-contract-error.js';

const USERS_ERROR_CODES = [
  'UNAUTHORIZED',
  'FORBIDDEN',
  'USER_NOT_FOUND',
  'PRIVACY_DENIED',
  'CANNOT_FOLLOW_SELF',
  'ALREADY_FOLLOWING',
  'NOT_FOLLOWING',
] as const satisfies readonly (keyof typeof usersErrors)[];

export function handleUsersError(
  error: unknown,
  errors: ContractErrorHandlers<typeof usersErrors>,
): never {
  handleContractError(error, USERS_ERROR_CODES, errors);
}

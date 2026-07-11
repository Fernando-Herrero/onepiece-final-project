import { serieErrors } from '@logpose/contracts/features/serie/contract';

import {
  type ContractErrorHandlers,
  handleContractError,
} from '../../integrations/orpc/handle-contract-error.js';

const SERIE_ERROR_CODES = [
  'SAGA_NOT_FOUND',
  'ARC_NOT_FOUND',
  'EPISODE_NOT_FOUND',
] as const satisfies readonly (keyof typeof serieErrors)[];

export function handleSerieError(
  error: unknown,
  errors: ContractErrorHandlers<typeof serieErrors>,
): never {
  handleContractError(error, SERIE_ERROR_CODES, errors);
}

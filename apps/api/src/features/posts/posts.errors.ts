import { postsErrors } from '@logpose/contracts/features/posts/contract';

import {
  type ContractErrorHandlers,
  handleContractError,
} from '../../integrations/orpc/handle-contract-error.js';

const POSTS_ERROR_CODES = [
  'UNAUTHORIZED',
  'FORBIDDEN',
  'POST_NOT_FOUND',
] as const satisfies readonly (keyof typeof postsErrors)[];

export function handlePostsError(
  error: unknown,
  errors: ContractErrorHandlers<typeof postsErrors>,
): never {
  handleContractError(error, POSTS_ERROR_CODES, errors);
}

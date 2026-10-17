import { oc } from '@orpc/contract';

import { commonErrors } from './common/errors.js';
import { authContract } from './features/auth/contract.js';
import { healthContract } from './features/health/contract.js';
import { postsContract } from './features/posts/contract.js';
import { serieContract } from './features/serie/contract.js';
import { usersContract } from './features/users/contract.js';

export const contract = oc.errors(commonErrors).prefix('/api').router({
  health: healthContract,
  auth: authContract,
  users: usersContract,
  posts: postsContract,
  serie: serieContract,
});

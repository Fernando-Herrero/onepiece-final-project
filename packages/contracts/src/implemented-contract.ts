import { oc } from '@orpc/contract';
import { authContract } from './features/auth/contract.js';
import { healthContract } from './features/health/contract.js';
import { serieContract } from './features/serie/contract.js';
import { usersContract } from './features/users/contract.js';

/** Subset of the API contract exposed in Swagger (Nest migrated modules). */
export const implementedContract = oc.prefix('/api').router({
  health: healthContract,
  auth: authContract,
  users: usersContract,
  serie: serieContract,
});

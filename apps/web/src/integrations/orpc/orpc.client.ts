import { createORPCClient } from '@orpc/client';
import type { ContractRouterClient } from '@orpc/contract';
import { OpenAPILink } from '@orpc/openapi-client/fetch';

import { getAuthToken } from '@/features/auth/auth.storage';
import { contract } from '@/integrations/orpc/orpc.contract';

const link = new OpenAPILink(contract, {
  url: () => {
    if (typeof window === 'undefined') {
      throw new Error('oRPC client is only available in the browser');
    }

    return `${window.location.origin}/api`;
  },
  headers: () => {
    const token = getAuthToken();

    return token ? { Authorization: `Bearer ${token}` } : {};
  },
});

export const client =
  createORPCClient<ContractRouterClient<typeof contract>>(link);

export type OrpcClient = typeof client;

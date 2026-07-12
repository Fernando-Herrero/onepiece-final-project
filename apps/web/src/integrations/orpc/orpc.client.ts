/**
 * Cliente oRPC del navegador (TanStack Query, mutaciones, etc.).
 * Peticiones a `/api/*` en el mismo origen; Next reescribe al Nest en dev/prod.
 * En SSR no se usa: la sesión se precarga vía `integrations/auth/server.ts`.
 */
import { createORPCClient } from '@orpc/client';
import type { ContractRouterClient } from '@orpc/contract';
import { OpenAPILink } from '@orpc/openapi-client/fetch';

import { contract } from '@/integrations/orpc/orpc.contract';

const link = new OpenAPILink(contract, {
  /** Mismo origen que la web (`/api/...` → proxy Next → Nest). Solo en browser. */
  url: () => {
    if (typeof window === 'undefined') {
      throw new Error('oRPC client is only available in the browser');
    }

    return `${window.location.origin}`;
  },
  /** Envía cookies de sesión en cada llamada (auth HTTP-only). */
  fetch: (input, init) =>
    fetch(input, {
      ...init,
      credentials: 'include',
    }),
});

/** Cliente tipado del contrato compartido (`@logpose/contracts`). */
export const client =
  createORPCClient<ContractRouterClient<typeof contract>>(link);

export type OrpcClient = typeof client;

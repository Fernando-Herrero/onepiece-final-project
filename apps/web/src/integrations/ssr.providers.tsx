/**
 * Capa que sí corre en el servidor (y en el cliente al hidratar).
 * Hoy solo TanStack Query: recibe `dehydratedState` de `getServerSideProps`.
 */
import type { ComponentProps } from 'react';

import TanStackQueryProvider from '@/integrations/tanstack-query/tanstack-query.provider';

export default function SSRProviders(
  props: ComponentProps<typeof TanStackQueryProvider>,
) {
  return <TanStackQueryProvider {...props} />;
}

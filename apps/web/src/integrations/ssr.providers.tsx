import type { ComponentProps } from 'react';

import TanStackQueryProvider from '@/integrations/tanstack-query/tanstack-query.provider';

export default function SSRProviders(
  props: ComponentProps<typeof TanStackQueryProvider>,
) {
  return <TanStackQueryProvider {...props} />;
}

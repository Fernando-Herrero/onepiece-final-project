import dynamic from 'next/dynamic';
import type { ComponentProps } from 'react';

import SSRProviders from '@/integrations/ssr.providers';

const NoSSRProvider = dynamic(() => import('@/integrations/no-ssr.providers'), {
  ssr: false,
});

export default function Providers(props: ComponentProps<typeof SSRProviders>) {
  const { children, ...rest } = props;

  return (
    <SSRProviders {...rest}>
      <NoSSRProvider>{children}</NoSSRProvider>
    </SSRProviders>
  );
}

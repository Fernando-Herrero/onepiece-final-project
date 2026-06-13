import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { PropsWithChildren } from 'react';
import { Toaster } from 'sonner';

import RadixThemesProvider from '@/integrations/radix-themes/radix-themes.provider';

export default function NoSSRProviders({ children }: PropsWithChildren) {
  return (
    <RadixThemesProvider>
      {children}
      <Toaster position="top-right" closeButton />
      {process.env.NODE_ENV === 'development' ? (
        <ReactQueryDevtools initialIsOpen={false} />
      ) : null}
    </RadixThemesProvider>
  );
}

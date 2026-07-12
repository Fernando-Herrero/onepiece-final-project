/**
 * Providers solo cliente (`dynamic` con `ssr: false` en `providers.tsx`).
 * Radix, toasts y devtools usan DOM/portales; no deben renderizarse en SSR.
 */
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { type PropsWithChildren, useEffect } from 'react';
import { Toaster } from 'sonner';

import RadixThemesProvider from '@/integrations/radix-themes/radix-themes.provider';

export default function NoSSRProviders({ children }: PropsWithChildren) {
  /** Limpieza legacy v2: auth v3 usa cookies HTTP-only, no `localStorage.token`. */
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    localStorage.removeItem('token');
  }, []);

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

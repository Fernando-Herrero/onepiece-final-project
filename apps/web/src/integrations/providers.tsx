/**
 * Compositor de providers usado en `_app.page.tsx`.
 * SSR por fuera (Query + hidratación) y No-SSR por dentro (Radix, toasts, devtools).
 */
import dynamic from 'next/dynamic';
import type { ComponentProps } from 'react';

import SSRProviders from '@/integrations/ssr.providers';

/** Carga solo en el navegador: evita mismatch de hidratación con Radix/Toaster. */
const NoSSRProvider = dynamic(() => import('@/integrations/no-ssr.providers'), {
  ssr: false,
});

/** Punto de entrada único: `_app` no conoce la separación SSR / No-SSR. */
export default function Providers(props: ComponentProps<typeof SSRProviders>) {
  const { children, ...rest } = props;

  return (
    <SSRProviders {...rest}>
      <NoSSRProvider>{children}</NoSSRProvider>
    </SSRProviders>
  );
}

import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { PropsWithChildren } from 'react';
import { Toaster } from 'sonner';

export default function NoSSRProviders({ children }: PropsWithChildren) {
  return (
    <>
      {children}
      <Toaster position="top-right" closeButton />
      {process.env.NODE_ENV === 'development' ? (
        <ReactQueryDevtools initialIsOpen={false} />
      ) : null}
    </>
  );
}

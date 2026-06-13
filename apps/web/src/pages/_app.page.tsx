import '@/styles/globals.css';

import type { DehydratedState } from '@tanstack/react-query';
import type { NextPage } from 'next';
import type { AppProps } from 'next/app';
import { appWithTranslation } from 'next-i18next/pages';
import type { ReactElement, ReactNode } from 'react';

import Providers from '@/integrations/providers';

export type NextPageWithLayout<P = unknown, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps<{
  dehydratedState?: DehydratedState;
}> & {
  Component: NextPageWithLayout;
};

function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? (page => page);

  return (
    <Providers dehydratedState={pageProps.dehydratedState}>
      {getLayout(<Component {...pageProps} />)}
    </Providers>
  );
}

export default appWithTranslation(App);

import '@/styles/globals.css';

import type { AppProps } from 'next/app';
import { appWithTranslation } from 'next-i18next/pages';

import Providers from '@/integrations/providers';

function App({ Component, pageProps }: AppProps) {
  return (
    <Providers>
      <Component {...pageProps} />
    </Providers>
  );
}

export default appWithTranslation(App);

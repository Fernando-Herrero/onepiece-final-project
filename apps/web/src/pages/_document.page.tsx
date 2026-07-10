import { Head, Html, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="es" data-scroll-behavior="smooth">
      <Head>
        <link rel="icon" href="/favicon.png" type="image/png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

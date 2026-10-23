import { Head, Html, Main, NextScript } from 'next/document';

import { ACCESSIBILITY_STORAGE_KEY } from '@/features/settings/use-apply-accessibility';

// En línea para que los data-attributes estén en <html> antes del primer pintado y de que GSAP monte.
const applyStoredAccessibility = `try {
  var a = JSON.parse(localStorage.getItem('${ACCESSIBILITY_STORAGE_KEY}'));
  if (a) {
    var d = document.documentElement.dataset;
    d.fontScale = a.fontScale;
    d.highContrast = String(a.highContrast);
    d.reduceMotion = String(a.reduceMotion);
  }
} catch (e) {}`;

export default function Document() {
  return (
    <Html lang="es" data-scroll-behavior="smooth">
      <Head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <script
          dangerouslySetInnerHTML={{ __html: applyStoredAccessibility }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

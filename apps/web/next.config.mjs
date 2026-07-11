import path from 'node:path';
import { fileURLToPath } from 'node:url';

import nextI18nConfig from './next-i18next.config.js';

const appDir = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.join(appDir, '..', '..');

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['page.tsx', 'page.ts'],
  outputFileTracingRoot: monorepoRoot,
  outputFileTracingIncludes: {
    '/**/*': ['./next-i18next.config.js', './public/locales/**/*'],
  },
  transpilePackages: ['@logpose/contracts'],
  i18n: nextI18nConfig.i18n,

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  async rewrites() {
    const apiUrl =
      process.env.API_INTERNAL_URL ??
      (process.env.NODE_ENV === 'development' ? 'http://localhost:4000' : null);

    if (!apiUrl) return [];

    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          destination: `${apiUrl}/api/:path*`,
        },
      ],
    };
  },
};

export default nextConfig;

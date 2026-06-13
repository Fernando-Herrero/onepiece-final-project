import nodeConfig from '@logpose/eslint-config/node.eslint.config.js';

/** @type {import('typescript-eslint').ConfigArray} */
const config = [
  {
    ignores: [
      'dist/',
      'node_modules/',
      '.turbo/',
      '*.config.js',
      '*.config.mjs',
      '*.config.cjs',
    ],
  },
  ...nodeConfig,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];

export default config;

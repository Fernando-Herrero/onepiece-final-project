import nestConfig from '@logpose/eslint-config/nest.eslint.config.js';

/** @type {import('typescript-eslint').ConfigArray} */
const config = [
  {
    ignores: [
      'dist/',
      'node_modules/',
      '.turbo/',
      'scripts/',
      '*.config.js',
      '*.config.mjs',
      '*.config.cjs',
    ],
  },
  ...nestConfig,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'import/no-extraneous-dependencies': [
        'error',
        {
          packageDir: import.meta.dirname,
        },
      ],
    },
  },
];

export default config;

import tanstackQueryPlugin from '@tanstack/eslint-plugin-query';
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import eslintConfigPrettier from 'eslint-config-prettier';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import turboPlugin from 'eslint-plugin-turbo';
import tseslint from 'typescript-eslint';

export default [
  ...nextCoreWebVitals,
  eslintConfigPrettier,
  ...tanstackQueryPlugin.configs['flat/recommended'],
  {
    rules: {
      '@tanstack/query/exhaustive-deps': [
        'error',
        {
          allowlist: {
            variables: ['client'],
          },
        },
      ],
    },
  },
  ...tseslint.configs.recommended,
  {
    settings: {
      'import/resolver': {
        node: {
          paths: [import.meta.dirname],
        },
      },
    },
    plugins: {
      turbo: turboPlugin,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unsafe-function-type': 'warn',
      '@typescript-eslint/no-import-type-side-effects': 'error',
      'import/no-extraneous-dependencies': [
        'error',
        {
          packageDir: import.meta.dirname,
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'zod',
              message:
                "Import from 'zod/v4' as a namespace: `import * as z from 'zod/v4'`. The root entrypoint pulls all 53 locales into the client bundle.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-unnecessary-condition': 'warn',
    },
  },
  {
    ignores: [
      '.next/',
      'node_modules/',
      'dist/',
      '.turbo/',
      '*.config.js',
      '*.config.mjs',
      '*.config.cjs',
      '*.config.ts',
    ],
  },
];

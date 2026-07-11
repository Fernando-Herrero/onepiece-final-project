import baseConfig from './node.eslint.config.js';

/** @type {import('typescript-eslint').ConfigArray} */
const config = [
  ...baseConfig,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },
];

export default config;

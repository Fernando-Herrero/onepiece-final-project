import baseConfig from './prettier.config.js';

/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
const config = {
  ...baseConfig,
  singleQuote: true,
  trailingComma: 'all',
  plugins: [...baseConfig.plugins, 'prettier-plugin-tailwindcss'],
};

export default config;

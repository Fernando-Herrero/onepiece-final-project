/** @type {import('next-i18next/pages').UserConfig} */
module.exports = {
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en', 'ja'],
  },
  ns: ['common'],
  defaultNS: 'common',
  reloadOnPrerender: process.env.NODE_ENV === 'development',
};

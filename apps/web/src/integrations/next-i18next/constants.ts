/** Debe coincidir con `next-i18next.config.js`, que Next lee en JS. */
export const LOCALES = ['es', 'en', 'ja'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'es';

export const LOCALE_FLAGS: Record<Locale, string> = {
  es: '🇪🇸',
  en: '🇬🇧',
  ja: '🇯🇵',
};

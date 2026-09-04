import type { ParseKeys } from 'i18next';

/**
 * Clave válida del namespace `common`, derivada de los JSON de `public/locales`.
 * Úsala cuando un componente reciba la clave por props en vez de literal,
 * para no perder el tipado que da `i18next.d.ts`.
 */
export type TranslationKey = ParseKeys<'common'>;

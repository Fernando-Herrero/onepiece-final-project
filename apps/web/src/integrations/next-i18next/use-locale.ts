import { useRouter } from 'next/router';

import { DEFAULT_LOCALE, LOCALES } from '@/integrations/next-i18next/constants';

/** Locale activo de Next, estrechado a los que tiene la app. */
export function useLocale() {
  const { locale } = useRouter();
  return LOCALES.find(item => item === locale) ?? DEFAULT_LOCALE;
}

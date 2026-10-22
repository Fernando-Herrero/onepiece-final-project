import type { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';

import { DEFAULT_LOCALE } from '@/integrations/next-i18next/constants';

export async function getDefaultI18nProps(context: GetServerSidePropsContext) {
  const locale = context.locale ?? DEFAULT_LOCALE;

  return {
    ...(await serverSideTranslations(locale, ['common'])),
  };
}

export async function getDashboardI18nProps(
  context: GetServerSidePropsContext,
) {
  const locale = context.locale ?? DEFAULT_LOCALE;

  return {
    ...(await serverSideTranslations(locale, ['common', 'serie'])),
  };
}

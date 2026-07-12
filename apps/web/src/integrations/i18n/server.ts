import type { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';

export async function getDefaultI18nProps(context: GetServerSidePropsContext) {
  const locale = context.locale ?? 'es';

  return {
    ...(await serverSideTranslations(locale, ['common'])),
  };
}

export async function getDashboardI18nProps(
  context: GetServerSidePropsContext,
) {
  const locale = context.locale ?? 'es';

  return {
    ...(await serverSideTranslations(locale, ['common', 'serie'])),
  };
}

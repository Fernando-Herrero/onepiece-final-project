import type { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';

import NotFoundPageContent from '@/features/landing/page-content/not-found.page-content';
import { DEFAULT_LOCALE } from '@/integrations/next-i18next/constants';

export default function NotFoundPage() {
  return <NotFoundPageContent />;
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? DEFAULT_LOCALE, ['common'])),
  },
});

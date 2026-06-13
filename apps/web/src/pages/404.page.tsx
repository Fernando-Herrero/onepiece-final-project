import type { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';

import NotFoundPageContent from '@/features/landing/not-found.page-content';

export default function NotFoundPage() {
  return <NotFoundPageContent />;
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'es', ['common'])),
  },
});

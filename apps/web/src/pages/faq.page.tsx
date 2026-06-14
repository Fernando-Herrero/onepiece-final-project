import type { GetServerSideProps } from 'next';

import FaqPageContent from '@/features/landing/page-content/faq.page-content';
import { getDefaultI18nProps } from '@/integrations/i18n/server';

export default function FaqPage() {
  return <FaqPageContent />;
}

export const getServerSideProps: GetServerSideProps = async context => ({
  props: await getDefaultI18nProps(context),
});

import type { GetServerSideProps } from 'next';

import LandingPageContent from '@/features/landing/page-content/landing.page-content';
import { getDefaultI18nProps } from '@/integrations/i18n/server';

export default function HomePage() {
  return <LandingPageContent />;
}

export const getServerSideProps: GetServerSideProps = async context => ({
  props: await getDefaultI18nProps(context),
});

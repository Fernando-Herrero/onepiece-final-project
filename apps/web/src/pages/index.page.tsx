import type { GetServerSideProps } from 'next';

import HomePageContent from '@/features/home/home.page-content';
import { getDefaultI18nProps } from '@/integrations/i18n/server';

export default function HomePage() {
  return <HomePageContent />;
}

export const getServerSideProps: GetServerSideProps = async context => ({
  props: await getDefaultI18nProps(context),
});

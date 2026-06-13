import type { GetServerSideProps } from 'next';

import MapPageContent from '@/features/landing/map.page-content';
import { getDefaultI18nProps } from '@/integrations/i18n/server';

export default function MapPage() {
  return <MapPageContent />;
}

export const getServerSideProps: GetServerSideProps = async context => ({
  props: await getDefaultI18nProps(context),
});

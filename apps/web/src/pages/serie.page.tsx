import type { GetServerSideProps } from 'next';

import SeriePageContent from '@/features/serie/page-content/serie.page-content';
import { getDefaultI18nProps } from '@/integrations/i18n/server';

export default function SeriePage() {
  return <SeriePageContent />;
}

export const getServerSideProps: GetServerSideProps = async context => ({
  props: await getDefaultI18nProps(context),
});

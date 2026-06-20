import type { GetServerSideProps } from 'next';

import CardsPageContent from '@/features/cards/page-content/cards.page-content';
import { getDefaultI18nProps } from '@/integrations/i18n/server';

export default function CardsPage() {
  return <CardsPageContent />;
}

export const getServerSideProps: GetServerSideProps = async context => ({
  props: await getDefaultI18nProps(context),
});

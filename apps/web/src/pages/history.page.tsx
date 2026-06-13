import type { GetServerSideProps } from 'next';

import HistoryPageContent from '@/features/landing/history.page-content';
import { getDefaultI18nProps } from '@/integrations/i18n/server';

export default function HistoryPage() {
  return <HistoryPageContent />;
}

export const getServerSideProps: GetServerSideProps = async context => ({
  props: await getDefaultI18nProps(context),
});

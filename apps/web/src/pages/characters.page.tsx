import type { GetServerSideProps } from 'next';

import CharactersPageContent from '@/features/landing/characters.page-content';
import { getDefaultI18nProps } from '@/integrations/i18n/server';

export default function CharactersPage() {
  return <CharactersPageContent />;
}

export const getServerSideProps: GetServerSideProps = async context => ({
  props: await getDefaultI18nProps(context),
});

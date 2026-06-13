import type { GetServerSideProps } from 'next';

import ContactPageContent from '@/features/landing/contact.page-content';
import { getDefaultI18nProps } from '@/integrations/i18n/server';

export default function ContactPage() {
  return <ContactPageContent />;
}

export const getServerSideProps: GetServerSideProps = async context => ({
  props: await getDefaultI18nProps(context),
});

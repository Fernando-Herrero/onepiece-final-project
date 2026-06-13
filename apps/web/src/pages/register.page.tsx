import type { GetServerSideProps } from 'next';

import RegisterPageContent from '@/features/auth/register.page-content';
import { getDefaultI18nProps } from '@/integrations/i18n/server';

export default function RegisterPage() {
  return <RegisterPageContent />;
}

export const getServerSideProps: GetServerSideProps = async context => ({
  props: await getDefaultI18nProps(context),
});

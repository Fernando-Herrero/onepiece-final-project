import type { GetServerSideProps } from 'next';

import LoginPageContent from '@/features/auth/login.page-content';
import { getDefaultI18nProps } from '@/integrations/i18n/server';

export default function LoginPage() {
  return <LoginPageContent />;
}

export const getServerSideProps: GetServerSideProps = async context => ({
  props: await getDefaultI18nProps(context),
});

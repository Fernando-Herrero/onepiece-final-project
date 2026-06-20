import { Flex } from '@radix-ui/themes';
import { useTranslation } from 'next-i18next/pages';
import { ErrorBoundary } from 'react-error-boundary';

import { QueryErrorFallback } from '@/components/error-boundary/query-error-fallback';
import { LoginFormComponent } from '@/features/auth/ui/login-form.component';
import { LandingPublicLayout } from '@/features/landing/ui/landing-public-layout.component';

export default function LoginPageContent() {
  const { t } = useTranslation();

  return (
    <LandingPublicLayout title={t('auth.login_title')} centered>
      <Flex justify="center">
        <ErrorBoundary FallbackComponent={QueryErrorFallback}>
          <LoginFormComponent />
        </ErrorBoundary>
      </Flex>
    </LandingPublicLayout>
  );
}

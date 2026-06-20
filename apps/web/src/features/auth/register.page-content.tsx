import { Flex } from '@radix-ui/themes';
import { useTranslation } from 'next-i18next/pages';
import { ErrorBoundary } from 'react-error-boundary';

import { QueryErrorFallback } from '@/components/error-boundary/query-error-fallback';
import { RegisterFormComponent } from '@/features/auth/ui/register-form.component';
import { LandingPublicLayout } from '@/features/landing/ui/landing-public-layout.component';

export default function RegisterPageContent() {
  const { t } = useTranslation();

  return (
    <LandingPublicLayout title={t('auth.register_title')} centered>
      <Flex justify="center">
        <ErrorBoundary FallbackComponent={QueryErrorFallback}>
          <RegisterFormComponent />
        </ErrorBoundary>
      </Flex>
    </LandingPublicLayout>
  );
}

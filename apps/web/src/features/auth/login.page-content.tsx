import { useTranslation } from 'next-i18next/pages';
import { ErrorBoundary } from 'react-error-boundary';

import { LoginFormComponent } from '@/features/auth/ui/login-form.component';
import { HomeErrorFallbackComponent } from '@/features/home/ui/home-error-fallback.component';
import { LandingPublicLayout } from '@/features/landing/ui/landing-public-layout.component';

export default function LoginPageContent() {
  const { t } = useTranslation();

  return (
    <LandingPublicLayout title={t('auth.login_title')} centered>
      <div className="flex justify-center">
        <ErrorBoundary FallbackComponent={HomeErrorFallbackComponent}>
          <LoginFormComponent />
        </ErrorBoundary>
      </div>
    </LandingPublicLayout>
  );
}

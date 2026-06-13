import { ErrorBoundary } from 'react-error-boundary';

import { LoginFormComponent } from '@/features/auth/ui/login-form.component';
import { HomeErrorFallbackComponent } from '@/features/home/ui/home-error-fallback.component';

export default function LoginPageContent() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <ErrorBoundary FallbackComponent={HomeErrorFallbackComponent}>
        <LoginFormComponent />
      </ErrorBoundary>
    </main>
  );
}

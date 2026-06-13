import { ErrorBoundary } from 'react-error-boundary';

import { HomeErrorFallback } from '@/features/auth/ui/home-error-fallback';
import { LoginForm } from '@/features/auth/ui/login-form';

export function LoginPageContent() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <ErrorBoundary FallbackComponent={HomeErrorFallback}>
        <LoginForm />
      </ErrorBoundary>
    </main>
  );
}

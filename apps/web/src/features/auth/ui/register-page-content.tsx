import { ErrorBoundary } from 'react-error-boundary';

import { HomeErrorFallback } from '@/features/auth/ui/home-error-fallback';
import { RegisterForm } from '@/features/auth/ui/register-form';

export function RegisterPageContent() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <ErrorBoundary FallbackComponent={HomeErrorFallback}>
        <RegisterForm />
      </ErrorBoundary>
    </main>
  );
}

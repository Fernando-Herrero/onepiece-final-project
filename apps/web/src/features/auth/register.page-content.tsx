import { ErrorBoundary } from 'react-error-boundary';

import { RegisterFormComponent } from '@/features/auth/ui/register-form.component';
import { HomeErrorFallbackComponent } from '@/features/home/ui/home-error-fallback.component';

export default function RegisterPageContent() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <ErrorBoundary FallbackComponent={HomeErrorFallbackComponent}>
        <RegisterFormComponent />
      </ErrorBoundary>
    </main>
  );
}

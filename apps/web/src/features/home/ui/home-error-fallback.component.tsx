import { useTranslation } from 'next-i18next/pages';
import type { FallbackProps } from 'react-error-boundary';

import { PageError } from '@/components/error-boundary/page-error';

export function HomeErrorFallbackComponent({
  error,
  resetErrorBoundary,
}: FallbackProps) {
  const { t } = useTranslation();

  return (
    <PageError
      title={t('errors.title')}
      message={error instanceof Error ? error.message : String(error)}
      onRetry={resetErrorBoundary}
      retryText={t('errors.retry')}
    />
  );
}

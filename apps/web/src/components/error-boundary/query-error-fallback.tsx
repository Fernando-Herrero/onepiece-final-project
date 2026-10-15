import { useTranslation } from 'next-i18next/pages';
import type { FallbackProps } from 'react-error-boundary';

import { PageError } from '@/components/error-boundary/page-error';

export function QueryErrorFallback({ resetErrorBoundary }: FallbackProps) {
  const { t } = useTranslation();

  return (
    <PageError
      title={t('errors.title')}
      message={t('errors.message')}
      onRetry={resetErrorBoundary}
      retryText={t('errors.retry')}
    />
  );
}

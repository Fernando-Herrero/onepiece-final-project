import { useTranslation } from 'next-i18next/pages';

import { useUsersListSuspenseQuery } from '@/features/auth/api/auth.hooks';

export function HomeUsersStats() {
  const { t } = useTranslation();
  const { data: users } = useUsersListSuspenseQuery();

  return (
    <p className="text-sm text-neutral-600">
      {t('home.api_ok', { count: users.length })}
    </p>
  );
}

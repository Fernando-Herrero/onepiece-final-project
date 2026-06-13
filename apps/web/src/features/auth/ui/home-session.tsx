import Link from 'next/link';
import { useTranslation } from 'next-i18next/pages';

import {
  useLogoutMutation,
  useMeSuspenseQuery,
} from '@/features/auth/api/auth.hooks';

export function HomeSession() {
  const { t } = useTranslation();
  const { data: me } = useMeSuspenseQuery();
  const logoutMutation = useLogoutMutation();

  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <p className="text-green-700">
        {t('auth.session_active', {
          username: me.username,
          email: me.email,
        })}
      </p>
      <button
        className="rounded border border-neutral-300 px-3 py-1 text-sm"
        type="button"
        onClick={() => logoutMutation.mutate()}
        disabled={logoutMutation.isPending}
      >
        {t('auth.logout')}
      </button>
    </div>
  );
}

export function HomeGuestLinks() {
  const { t } = useTranslation();

  return (
    <nav className="flex gap-4 text-sm underline">
      <Link href="/login">{t('home.login')}</Link>
      <Link href="/register">{t('home.register')}</Link>
    </nav>
  );
}

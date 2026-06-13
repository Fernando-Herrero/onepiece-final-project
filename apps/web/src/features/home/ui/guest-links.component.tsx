import Link from 'next/link';
import { useTranslation } from 'next-i18next/pages';

export function GuestLinksComponent() {
  const { t } = useTranslation();

  return (
    <nav className="flex gap-4 text-sm underline">
      <Link href="/login">{t('home.login')}</Link>
      <Link href="/register">{t('home.register')}</Link>
    </nav>
  );
}

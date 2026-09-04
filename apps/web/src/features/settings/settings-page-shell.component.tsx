import { Card, Heading, Text } from '@radix-ui/themes';
import Link from 'next/link';
import { useTranslation } from 'next-i18next/pages';
import type { ReactNode } from 'react';

import { Icon } from '@/components/icons/icon';
import type { TranslationKey } from '@/integrations/next-i18next/translation-key';

type SettingsPageShellProps = {
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
  children: ReactNode;
};

/** Cabecera común de las páginas de ajustes: enlace de vuelta, título y descripción. */
export function SettingsPageShell({
  titleKey,
  descriptionKey,
  children,
}: SettingsPageShellProps) {
  const { t } = useTranslation();

  return (
    <Card className="mx-auto max-w-xl border border-[#f2d9a8]/15 bg-[#05070d]/50 p-6 motion-safe:animate-[profile-fade-up_0.45s_ease-out_both]">
      <Link
        href="/dashboard/settings"
        className="mb-4 inline-flex items-center gap-1 text-sm text-[#f2d9a8]/80 underline-offset-2 hover:text-[#f2d9a8] hover:underline"
      >
        <Icon.CaretLeft aria-hidden />
        {t('settings.back')}
      </Link>

      <Heading
        as="h1"
        size="6"
        mb="2"
        className="font-one-piece text-[#f2d9a8]"
      >
        {t(titleKey)}
      </Heading>
      <Text as="p" size="2" mb="5" className="text-[#f4ede1]/75">
        {t(descriptionKey)}
      </Text>

      {children}
    </Card>
  );
}

import { Card, Heading, Text } from '@radix-ui/themes';
import Link from 'next/link';
import { useTranslation } from 'next-i18next/pages';
import type { ReactNode } from 'react';

import { Icon } from '@/components/icons/icon';
import type { TranslationKey } from '@/integrations/next-i18next/translation-key';

type SettingsPageShellProps = {
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
  /** Destino del enlace de vuelta; por defecto, el índice de ajustes. */
  backHref?: string;
  backLabelKey?: TranslationKey;
  /** Para contenido en rejilla (personajes), que no cabe en la columna estrecha. */
  wide?: boolean;
  children: ReactNode;
};

/** Cabecera común de las páginas de ajustes: enlace de vuelta, título y descripción. */
export function SettingsPageShell({
  titleKey,
  descriptionKey,
  backHref = '/dashboard/settings',
  backLabelKey = 'settings.back',
  wide = false,
  children,
}: SettingsPageShellProps) {
  const { t } = useTranslation();

  return (
    <Card
      className={`card mx-auto p-6 motion-safe:animate-[profile-fade-up_0.45s_ease-out_both] ${
        wide ? 'max-w-5xl' : 'max-w-xl'
      }`}
    >
      <Link
        href={backHref}
        className="text-highlight/80 hover:text-highlight mb-4 inline-flex items-center gap-1 text-sm underline-offset-2 hover:underline"
      >
        <Icon.CaretLeft aria-hidden />
        {t(backLabelKey)}
      </Link>

      <Heading
        as="h1"
        size="6"
        mb="2"
        className="font-one-piece text-highlight"
      >
        {t(titleKey)}
      </Heading>
      <Text as="p" size="2" mb="5" className="text-foreground/75">
        {t(descriptionKey)}
      </Text>

      {children}
    </Card>
  );
}

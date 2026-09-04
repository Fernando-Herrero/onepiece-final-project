import { Badge, Card, Flex, Text } from '@radix-ui/themes';
import Link from 'next/link';
import { useTranslation } from 'next-i18next/pages';
import type { ReactNode } from 'react';

import { Icon } from '@/components/icons/icon';
import { SettingsPageShell } from '@/features/settings/settings-page-shell.component';
import type { TranslationKey } from '@/integrations/next-i18next/translation-key';

type ResourceLink = {
  id: string;
  href: string;
  external?: boolean;
  icon: ReactNode;
  titleKey: TranslationKey;
  textKey: TranslationKey;
};

/** Enlaces a páginas que ya existen en la app, más el repositorio del proyecto. */
const RESOURCES: ResourceLink[] = [
  {
    id: 'faq',
    href: '/faq',
    icon: <Icon.BookOpen />,
    titleKey: 'settings.resources.faq_title',
    textKey: 'settings.resources.faq_text',
  },
  {
    id: 'contact',
    href: '/contact',
    icon: <Icon.Comment />,
    titleKey: 'settings.resources.contact_title',
    textKey: 'settings.resources.contact_text',
  },
  {
    id: 'characters',
    href: '/characters',
    icon: <Icon.User />,
    titleKey: 'settings.resources.characters_title',
    textKey: 'settings.resources.characters_text',
  },
  {
    id: 'privacy',
    href: '/dashboard/settings/privacy',
    icon: <Icon.ShieldCheck />,
    titleKey: 'settings.resources.privacy_title',
    textKey: 'settings.resources.privacy_text',
  },
  {
    id: 'wiki',
    href: 'https://onepiece.fandom.com/wiki/One_Piece_Wiki',
    external: true,
    icon: <Icon.BookOpen />,
    titleKey: 'settings.resources.wiki_title',
    textKey: 'settings.resources.wiki_text',
  },
];

export default function SettingsResourcesPageContent() {
  const { t } = useTranslation();

  return (
    <SettingsPageShell
      titleKey="settings.title_resources"
      descriptionKey="settings.resources.description"
    >
      <Flex direction="column" gap="3">
        {RESOURCES.map(resource => {
          const body = (
            <Flex gap="3" align="start">
              <span className="mt-0.5 text-[#f2d9a8]">{resource.icon}</span>
              <Flex direction="column" gap="1" className="min-w-0">
                <Flex align="center" gap="2">
                  <Text
                    as="p"
                    size="2"
                    weight="medium"
                    className="text-[#f2d9a8]/90"
                  >
                    {t(resource.titleKey)}
                  </Text>
                  {resource.external ? (
                    <Badge size="1" variant="soft" color="gray">
                      {t('settings.resources.external')}
                    </Badge>
                  ) : null}
                </Flex>
                <Text as="p" size="2" className="text-[#f4ede1]/65">
                  {t(resource.textKey)}
                </Text>
              </Flex>
            </Flex>
          );

          return (
            <Card
              key={resource.id}
              asChild
              className="border border-[#f2d9a8]/12 bg-[#1b2742]/30 p-3 transition-colors hover:border-[#f2d9a8]/35"
            >
              {resource.external ? (
                <a
                  href={resource.href}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {body}
                </a>
              ) : (
                <Link href={resource.href}>{body}</Link>
              )}
            </Card>
          );
        })}
      </Flex>
    </SettingsPageShell>
  );
}

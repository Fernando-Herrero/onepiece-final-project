import { Flex, Select, Text } from '@radix-ui/themes';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next/pages';

const LOCALES = ['es', 'en', 'ja'] as const;

const LOCALE_FLAGS: Record<(typeof LOCALES)[number], string> = {
  es: '🇪🇸',
  en: '🇬🇧',
  ja: '🇯🇵',
};

type LandingLocaleToggleComponentProps = {
  compactLabel?: boolean;
};

export function LandingLocaleToggleComponent({
  compactLabel = false,
}: LandingLocaleToggleComponentProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const activeLocale = (router.locale ?? 'es') as (typeof LOCALES)[number];
  const triggerLabel = compactLabel
    ? activeLocale.toUpperCase()
    : t(`landing.locales.${activeLocale}`);

  return (
    <Select.Root
      value={activeLocale}
      onValueChange={locale =>
        router.push(router.pathname, router.asPath, {
          locale,
          scroll: false,
        })
      }
    >
      <Select.Trigger
        variant="soft"
        color="gray"
        aria-label={t('landing.nav.language')}
      >
        <Flex as="span" align="center" gap="2">
          <span aria-hidden>{LOCALE_FLAGS[activeLocale]}</span>
          <Text size="2" className="uppercase">
            {triggerLabel}
          </Text>
        </Flex>
      </Select.Trigger>
      <Select.Content
        position="popper"
        sideOffset={6}
        highContrast
        className="z-70"
      >
        {LOCALES.map(locale => (
          <Select.Item key={locale} value={locale}>
            <Flex align="center" gap="2">
              <span aria-hidden>{LOCALE_FLAGS[locale]}</span>
              {t(`landing.locales.${locale}`)}
            </Flex>
          </Select.Item>
        ))}
      </Select.Content>
    </Select.Root>
  );
}

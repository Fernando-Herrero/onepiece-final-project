import { Flex, Separator, Text } from '@radix-ui/themes';
import { useTranslation } from 'next-i18next/pages';

import { LandingLocaleToggleComponent } from '@/features/landing/ui/landing-locale-toggle.component';

export function LandingFooterComponent() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-[#a64242]/30 bg-[#080d18] px-6 py-8">
      <Flex
        direction="column"
        align="center"
        gap="4"
        className="mx-auto max-w-3xl text-center"
      >
        <LandingLocaleToggleComponent />
        <Separator size="4" className="w-full max-w-xs bg-white/10" />
        <Text as="p" size="1" color="gray" className="leading-relaxed">
          {t('landing.footer.disclaimer')}
        </Text>
        <Text as="p" size="1" color="gray" className="opacity-70">
          &copy; {year} {t('landing.footer.copyright')}
        </Text>
      </Flex>
    </footer>
  );
}

import { Flex, Link as RadixLink, Separator, Text } from '@radix-ui/themes';
import Link from 'next/link';
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
        <nav
          aria-label="Footer"
          className="flex flex-wrap justify-center gap-5 font-road-captain text-sm uppercase tracking-[0.15em]"
        >
          <RadixLink asChild color="gray" highContrast>
            <Link href="/#features">{t('landing.nav.features')}</Link>
          </RadixLink>
          <RadixLink asChild color="gray" highContrast>
            <Link href="/history">{t('landing.nav.history')}</Link>
          </RadixLink>
          <RadixLink asChild color="gray" highContrast>
            <Link href="/characters">{t('landing.nav.characters')}</Link>
          </RadixLink>
          <RadixLink asChild color="gray" highContrast>
            <Link href="/map">{t('landing.nav.map')}</Link>
          </RadixLink>
          <RadixLink asChild color="gray" highContrast>
            <Link href="/faq">{t('landing.nav.faq')}</Link>
          </RadixLink>
          <RadixLink asChild color="gray" highContrast>
            <Link href="/contact">{t('landing.nav.contact')}</Link>
          </RadixLink>
          <RadixLink asChild color="gray" highContrast>
            <Link href="/login">{t('landing.nav.sign_in')}</Link>
          </RadixLink>
          <RadixLink asChild color="gray" highContrast>
            <Link href="/register">{t('landing.nav.sign_up')}</Link>
          </RadixLink>
        </nav>
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

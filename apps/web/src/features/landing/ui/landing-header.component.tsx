import { Button, DropdownMenu, Flex } from '@radix-ui/themes';
import { gsap } from 'gsap';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next/pages';
import { useEffect, useRef, useState } from 'react';

import { LandingLocaleToggleComponent } from '@/features/landing/ui/landing-locale-toggle.component';
import {
  LandingMenuToggleButton,
  LandingMobileMenuPanel,
} from '@/features/landing/ui/landing-mobile-menu.component';

const NAV_LINK_CLASS =
  'inline-flex shrink-0 cursor-pointer items-center rounded-md px-3 py-1.5 font-road-captain text-sm uppercase tracking-[0.12em] text-[#f4ede1]/85 transition-colors hover:bg-white/5 hover:text-[#f2d9a8]';

export function LandingHeaderComponent() {
  const { t } = useTranslation();
  const router = useRouter();
  const headerRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isHome = router.pathname === '/';
  const solidHeader = menuOpen || scrolled || !isHome;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = () => {
      if (mq.matches) setMenuOpen(false);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (prefersReduced || !headerRef.current) return;

    gsap.fromTo(
      headerRef.current,
      { autoAlpha: 0, y: -24 },
      { autoAlpha: 1, y: 0, duration: 0.9, delay: 0.35, ease: 'power2.out' },
    );
  }, []);

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          solidHeader
            ? 'border-b border-white/10 bg-[#05070d]/90 py-3 backdrop-blur-md'
            : 'bg-transparent py-5 md:py-6'
        }`}
      >
        <Flex
          align="center"
          justify="between"
          gap="4"
          px="5"
          className="mx-auto max-w-6xl md:px-8"
        >
          <Link
            href="/"
            className="shrink-0 transition-opacity hover:opacity-90"
          >
            <Image
              src="/landing/one-piece-logo.webp"
              alt="One Piece LogPose"
              width={80}
              height={40}
              className="h-9 w-auto md:h-10"
              priority
            />
          </Link>

          <Flex
            align="center"
            gap="3"
            display={{ initial: 'none', md: 'flex' }}
            className="shrink-0"
          >
            <Link href="/#features" className={NAV_LINK_CLASS}>
              {t('landing.nav.features')}
            </Link>

            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <button type="button" className={NAV_LINK_CLASS}>
                  {t('landing.nav.onepiece')}
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content>
                <DropdownMenu.Item asChild>
                  <Link href="/history">{t('landing.nav.history')}</Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item asChild>
                  <Link href="/characters">{t('landing.nav.characters')}</Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item asChild>
                  <Link href="/map">{t('landing.nav.map')}</Link>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>

            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <button type="button" className={NAV_LINK_CLASS}>
                  {t('landing.nav.help')}
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content>
                <DropdownMenu.Item asChild>
                  <Link href="/faq">{t('landing.nav.faq')}</Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item asChild>
                  <Link href="/contact">{t('landing.nav.contact')}</Link>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>

            <LandingLocaleToggleComponent />
            <Button
              variant="soft"
              color="orange"
              size="2"
              className="!m-0 shrink-0"
              asChild
            >
              <Link href="/login">{t('landing.nav.sign_in')}</Link>
            </Button>
            <Button color="orange" size="2" className="!m-0 shrink-0" asChild>
              <Link href="/register">{t('landing.nav.sign_up')}</Link>
            </Button>
          </Flex>

          <LandingMenuToggleButton
            open={menuOpen}
            onToggle={() => setMenuOpen(open => !open)}
          />
        </Flex>
      </header>

      <LandingMobileMenuPanel
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />
    </>
  );
}

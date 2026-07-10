import { Button, DropdownMenu, Flex } from '@radix-ui/themes';
import { gsap } from 'gsap';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next/pages';
import { useEffect, useRef, useState } from 'react';

import { isMotionDisabled } from '@/features/landing/motion/landing-motion';
import { LandingLocaleToggleComponent } from '@/features/landing/ui/landing-locale-toggle.component';
import {
  LandingMenuToggleButton,
  LandingMobileMenuPanel,
} from '@/features/landing/ui/landing-mobile-menu.component';

let headerIntroPlayed = false;

const NAV_LINK_CLASS =
  '-m-0.5 relative inline-flex shrink-0 cursor-pointer items-center px-1 py-1.5 font-road-captain font-bold text-sm uppercase tracking-[0.12em] text-[#f4ede1]/85 transition-colors hover:text-[#f2d9a8] after:absolute after:inset-x-1 after:bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-[#f2d9a8]/70 after:transition-transform after:duration-300 hover:after:scale-x-100';

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
    if (isMotionDisabled() || !headerRef.current) return;

    if (headerIntroPlayed) {
      gsap.set(headerRef.current, { autoAlpha: 1, y: 0 });
      return;
    }

    headerIntroPlayed = true;
    gsap.fromTo(
      headerRef.current,
      { autoAlpha: 0, y: -20 },
      { autoAlpha: 1, y: 0, duration: 0.8, delay: 0.15, ease: 'power3.out' },
    );
  }, []);

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed inset-x-0 top-0 z-50 py-3 transition-all duration-500 max-md:pt-[max(0.75rem,env(safe-area-inset-top))] ${
          solidHeader
            ? 'border-b border-white/10 bg-[#05070d]/90 backdrop-blur-md'
            : 'bg-transparent md:py-6'
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
              style={{ width: 'auto', height: 'auto' }}
              priority
            />
          </Link>

          <Flex
            align="center"
            gap="4"
            display={{ initial: 'none', md: 'flex' }}
            className="shrink-0"
          >
            <Link href="/#features" className={NAV_LINK_CLASS}>
              {t('landing.nav.features')}
            </Link>

            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <Button
                  type="button"
                  variant="ghost"
                  highContrast
                  className={NAV_LINK_CLASS}
                >
                  {t('landing.nav.onepiece')}
                </Button>
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
                <Button
                  type="button"
                  variant="ghost"
                  highContrast
                  className={NAV_LINK_CLASS}
                >
                  {t('landing.nav.help')}
                </Button>
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

            <LandingLocaleToggleComponent compactLabel />
            <Button
              variant="outline"
              highContrast
              size="2"
              radius="full"
              className="m-0! shrink-0"
              asChild
            >
              <Link href="/login">{t('landing.nav.sign_in')}</Link>
            </Button>
            <Button
              color="orange"
              size="2"
              radius="full"
              className="m-0! shrink-0 shadow-[0_0_24px_rgba(220,150,70,0.35)] transition-shadow duration-300 hover:shadow-[0_0_40px_rgba(220,150,70,0.55)]"
              asChild
            >
              <Link href="/register">{t('landing.nav.sign_up')}</Link>
            </Button>
          </Flex>

          <Flex
            align="center"
            gap="2"
            display={{ initial: 'flex', md: 'none' }}
            className="shrink-0"
          >
            <LandingLocaleToggleComponent compactLabel />
            <LandingMenuToggleButton
              open={menuOpen}
              onToggle={() => setMenuOpen(open => !open)}
            />
          </Flex>
        </Flex>
      </header>

      <LandingMobileMenuPanel
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />
    </>
  );
}

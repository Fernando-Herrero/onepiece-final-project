import { Button, Flex } from '@radix-ui/themes';
import { gsap } from 'gsap';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'next-i18next/pages';
import { useEffect, useRef, useState } from 'react';

import { LandingLocaleToggleComponent } from '@/features/landing/ui/landing-locale-toggle.component';
import {
  LandingMenuToggleButton,
  LandingMobileMenuPanel,
} from '@/features/landing/ui/landing-mobile-menu.component';

export function LandingHeaderComponent() {
  const { t } = useTranslation();
  const headerRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
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
          menuOpen || scrolled
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
            gap="4"
            display={{ initial: 'none', md: 'flex' }}
          >
            <Button variant="ghost" highContrast asChild>
              <a href="#features">{t('landing.nav.features')}</a>
            </Button>
            <LandingLocaleToggleComponent />
            <Button variant="ghost" highContrast asChild>
              <Link href="/login">{t('landing.nav.sign_in')}</Link>
            </Button>
            <Button color="orange" asChild>
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

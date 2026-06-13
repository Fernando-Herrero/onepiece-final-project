import { gsap } from 'gsap';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'next-i18next/pages';
import { useEffect, useRef, useState } from 'react';

import { LandingLocaleToggleComponent } from '@/features/landing/ui/landing-locale-toggle.component';

export function LandingHeaderComponent() {
  const { t } = useTranslation();
  const headerRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);

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
    <header
      ref={headerRef}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'border-b border-white/10 bg-[#05070d]/80 py-3 backdrop-blur-md'
          : 'bg-transparent py-5 md:py-6'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 md:px-8">
        <Link href="/" className="shrink-0 transition-opacity hover:opacity-90">
          <Image
            src="/landing/one-piece-logo.webp"
            alt="One Piece LogPose"
            width={80}
            height={40}
            className="h-9 w-auto md:h-10"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <a
            href="#features"
            className="font-[family-name:var(--font-road-captain)] text-sm uppercase tracking-[0.2em] text-[#f4ede1]/75 transition-colors hover:text-[#f2d9a8]"
          >
            {t('landing.nav.features')}
          </a>
          <LandingLocaleToggleComponent />
          <Link
            href="/login"
            className="font-[family-name:var(--font-road-captain)] text-sm uppercase tracking-[0.15em] text-[#f4ede1]/80 transition-colors hover:text-[#f2d9a8]"
          >
            {t('landing.nav.sign_in')}
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-gradient-to-br from-[#f0713f] to-[#f5a261] px-5 py-2 font-[family-name:var(--font-road-captain)] text-sm uppercase tracking-[0.12em] text-[#1a0f08] shadow-[0_8px_24px_rgba(240,113,63,0.35)] transition-transform hover:-translate-y-0.5"
          >
            {t('landing.nav.sign_up')}
          </Link>
        </nav>

        <div className="flex items-center gap-3 md:hidden">
          <LandingLocaleToggleComponent />
          <Link
            href="/register"
            className="rounded-full border border-[#f2d9a8]/40 px-3 py-1.5 font-[family-name:var(--font-road-captain)] text-xs uppercase tracking-wider text-[#f2d9a8]"
          >
            {t('landing.nav.sign_up')}
          </Link>
        </div>
      </div>
    </header>
  );
}

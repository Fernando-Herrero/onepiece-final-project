import { Button, Flex, Text } from '@radix-ui/themes';
import Link from 'next/link';
import { useTranslation } from 'next-i18next/pages';
import { useEffect } from 'react';

import { LandingLocaleToggleComponent } from '@/features/landing/ui/landing-locale-toggle.component';

type LandingMobileMenuPanelProps = {
  open: boolean;
  onClose: () => void;
};

export function LandingMobileMenuPanel({
  open,
  onClose,
}: LandingMobileMenuPanelProps) {
  const { t } = useTranslation();

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  return (
    <div
      id="landing-mobile-menu"
      className={`fixed inset-0 z-40 flex flex-col px-6 pt-24 pb-10 transition-all duration-300 ease-out md:hidden ${
        open
          ? 'visible translate-x-0 opacity-100'
          : 'pointer-events-none invisible translate-x-full opacity-0'
      } bg-linear-to-br from-[#05070d] via-[#0b1120] to-[#1b2742]/90 backdrop-blur-md`}
      aria-hidden={!open}
    >
      <Flex direction="column" gap="6" className="min-h-0 flex-1 px-2 pt-6">
        <Flex justify="end">
          <LandingLocaleToggleComponent />
        </Flex>

        <nav className="flex flex-col gap-6">
          <Link
            href="/#features"
            onClick={onClose}
            className="font-road-captain text-lg tracking-[0.2em] text-[#f4ede1]/85 uppercase transition-colors hover:text-[#f2d9a8]"
          >
            {t('landing.nav.features')}
          </Link>

          <div className="flex flex-col gap-3">
            <Text
              as="span"
              size="1"
              color="gray"
              className="font-road-captain tracking-[0.2em] uppercase"
            >
              {t('landing.nav.onepiece')}
            </Text>
            <Link
              href="/history"
              onClick={onClose}
              className="font-road-captain text-base tracking-[0.15em] text-[#f4ede1]/75 uppercase transition-colors hover:text-[#f2d9a8]"
            >
              {t('landing.nav.history')}
            </Link>
            <Link
              href="/characters"
              onClick={onClose}
              className="font-road-captain text-base tracking-[0.15em] text-[#f4ede1]/75 uppercase transition-colors hover:text-[#f2d9a8]"
            >
              {t('landing.nav.characters')}
            </Link>
            <Link
              href="/map"
              onClick={onClose}
              className="font-road-captain text-base tracking-[0.15em] text-[#f4ede1]/75 uppercase transition-colors hover:text-[#f2d9a8]"
            >
              {t('landing.nav.map')}
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            <Text
              as="span"
              size="1"
              color="gray"
              className="font-road-captain tracking-[0.2em] uppercase"
            >
              {t('landing.nav.help')}
            </Text>
            <Link
              href="/faq"
              onClick={onClose}
              className="font-road-captain text-base tracking-[0.15em] text-[#f4ede1]/75 uppercase transition-colors hover:text-[#f2d9a8]"
            >
              {t('landing.nav.faq')}
            </Link>
            <Link
              href="/contact"
              onClick={onClose}
              className="font-road-captain text-base tracking-[0.15em] text-[#f4ede1]/75 uppercase transition-colors hover:text-[#f2d9a8]"
            >
              {t('landing.nav.contact')}
            </Link>
          </div>
        </nav>

        <Flex
          gap="3"
          pt="6"
          className="mt-auto w-full border-t border-white/15"
        >
          <Button color="gold" className="flex-1" asChild>
            <Link href="/login" onClick={onClose}>
              {t('landing.nav.sign_in')}
            </Link>
          </Button>
          <Button color="orange" className="flex-1" asChild>
            <Link href="/register" onClick={onClose}>
              {t('landing.nav.sign_up')}
            </Link>
          </Button>
        </Flex>
      </Flex>
    </div>
  );
}

type LandingMenuToggleButtonProps = {
  open: boolean;
  onToggle: () => void;
};

export function LandingMenuToggleButton({
  open,
  onToggle,
}: LandingMenuToggleButtonProps) {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls="landing-mobile-menu"
      aria-label={
        open ? t('landing.nav.close_menu') : t('landing.nav.open_menu')
      }
      className={`relative z-60 flex h-10 w-10 shrink-0 cursor-pointer flex-col items-center justify-center rounded-full transition-colors duration-300 md:hidden ${
        open
          ? 'border border-[#f2d9a8]/50 bg-[#05070d]/90 shadow-[0_0_20px_rgba(0,0,0,0.45)] hover:bg-[#05070d]'
          : 'hover:bg-white/10'
      }`}
    >
      <span
        className={`absolute block h-0.5 rounded-full transition-all duration-300 ease-out ${
          open
            ? 'w-4 rotate-45 bg-[#f2d9a8]'
            : 'w-6 -translate-y-1 rotate-0 bg-[#f4ede1]'
        }`}
      />
      <span
        className={`absolute block h-0.5 rounded-full transition-all duration-300 ease-out ${
          open
            ? 'w-4 -rotate-45 bg-[#f2d9a8]'
            : 'w-6 translate-y-1 rotate-0 bg-[#f4ede1]'
        }`}
      />
    </button>
  );
}

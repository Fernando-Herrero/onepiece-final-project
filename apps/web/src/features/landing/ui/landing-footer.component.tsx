import { useTranslation } from 'next-i18next/pages';

import { LandingLocaleToggleComponent } from '@/features/landing/ui/landing-locale-toggle.component';

export function LandingFooterComponent() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-[#a64242]/30 bg-[#080d18] px-6 py-8">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
        <LandingLocaleToggleComponent />
        <p className="text-xs leading-relaxed text-[#f4ede1]/55">
          {t('landing.footer.disclaimer')}
        </p>
        <p className="text-xs text-[#f4ede1]/40">
          &copy; {year} {t('landing.footer.copyright')}
        </p>
      </div>
    </footer>
  );
}

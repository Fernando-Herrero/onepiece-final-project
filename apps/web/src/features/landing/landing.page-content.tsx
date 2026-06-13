import Head from 'next/head';
import { useTranslation } from 'next-i18next/pages';

import { FeatureCardsComponent } from '@/features/landing/ui/feature-cards.component';
import { HeroMaskComponent } from '@/features/landing/ui/hero-mask.component';
import { LandingCtaComponent } from '@/features/landing/ui/landing-cta.component';
import { LandingFooterComponent } from '@/features/landing/ui/landing-footer.component';
import { LandingHeaderComponent } from '@/features/landing/ui/landing-header.component';

export default function LandingPageContent() {
  const { t } = useTranslation();

  return (
    <div className="landing scroll-smooth bg-[#05070d] text-[#f4ede1]">
      <Head>
        <title>{t('landing.meta_title')}</title>
        <meta name="description" content={t('landing.meta_description')} />
      </Head>
      <LandingHeaderComponent />
      <HeroMaskComponent />

      <div
        className="relative z-10 mx-auto h-px max-w-4xl bg-linear-to-r from-transparent via-[#f2d9a8]/35 to-transparent"
        aria-hidden="true"
      />

      <FeatureCardsComponent />
      <LandingCtaComponent />
      <LandingFooterComponent />
    </div>
  );
}

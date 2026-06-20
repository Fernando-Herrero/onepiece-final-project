import { Box } from '@radix-ui/themes';
import Head from 'next/head';
import { useTranslation } from 'next-i18next/pages';

import { useSmoothScroll } from '@/features/landing/motion/use-smooth-scroll';
import { CinematicShowcaseComponent } from '@/features/landing/ui/cinematic-showcase.component';
import { FeatureCardsComponent } from '@/features/landing/ui/feature-cards.component';
import { HeroMaskComponent } from '@/features/landing/ui/hero-mask.component';
import { LandingCtaComponent } from '@/features/landing/ui/landing-cta.component';
import { LandingFooterComponent } from '@/features/landing/ui/landing-footer.component';
import { LandingHeaderComponent } from '@/features/landing/ui/landing-header.component';

export default function LandingPageContent() {
  const { t } = useTranslation();
  useSmoothScroll();

  return (
    <Box className="landing scroll-smooth bg-[#05070d] text-[#f4ede1]">
      <Head>
        <title>{t('landing.meta_title')}</title>
        <meta name="description" content={t('landing.meta_description')} />
      </Head>
      <LandingHeaderComponent />
      <HeroMaskComponent />
      <FeatureCardsComponent />
      <CinematicShowcaseComponent />
      <LandingCtaComponent />
      <LandingFooterComponent />
    </Box>
  );
}

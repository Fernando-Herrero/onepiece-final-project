import Link from 'next/link';
import { useTranslation } from 'next-i18next/pages';

import { FeatureCardsComponent } from '@/features/landing/ui/feature-cards.component';
import { HeroMaskComponent } from '@/features/landing/ui/hero-mask.component';

export default function LandingPageContent() {
  const { t } = useTranslation();

  return (
    <div className="landing">
      <HeroMaskComponent />
      <FeatureCardsComponent />

      <section className="landing-cta">
        <h2 className="landing-cta-title">{t('landing.cta_title')}</h2>
        <div className="landing-cta-actions">
          <Link href="/register" className="landing-btn landing-btn-primary">
            {t('home.register')}
          </Link>
          <Link href="/login" className="landing-btn landing-btn-ghost">
            {t('home.login')}
          </Link>
        </div>
      </section>
    </div>
  );
}

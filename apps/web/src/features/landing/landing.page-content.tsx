import { FeatureCardsComponent } from '@/features/landing/ui/feature-cards.component';
import { HeroMaskComponent } from '@/features/landing/ui/hero-mask.component';
import { LandingCtaComponent } from '@/features/landing/ui/landing-cta.component';
import { LandingFooterComponent } from '@/features/landing/ui/landing-footer.component';
import { LandingHeaderComponent } from '@/features/landing/ui/landing-header.component';

export default function LandingPageContent() {
  return (
    <div className="landing scroll-smooth bg-[#05070d] text-[#f4ede1]">
      <LandingHeaderComponent />
      <HeroMaskComponent />

      <div
        className="relative z-10 mx-auto h-px max-w-4xl bg-gradient-to-r from-transparent via-[#f2d9a8]/35 to-transparent"
        aria-hidden="true"
      />

      <FeatureCardsComponent />
      <LandingCtaComponent />
      <LandingFooterComponent />
    </div>
  );
}

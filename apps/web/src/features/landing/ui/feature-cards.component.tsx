import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTranslation } from 'next-i18next/pages';
import { useEffect, useRef } from 'react';

const FEATURES = [
  { emoji: '🎯', key: 'dashboard' },
  { emoji: '💬', key: 'social' },
  { emoji: '📚', key: 'content' },
  { emoji: '🏆', key: 'gamification' },
  { emoji: '🗺️', key: 'progress' },
  { emoji: '📱', key: 'mobile' },
] as const;

export function FeatureCardsComponent() {
  const { t } = useTranslation();
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>('.landing-card');

      gsap.set(cards, { autoAlpha: 0, y: 80, scale: 0.94 });

      ScrollTrigger.batch(cards, {
        start: 'top 88%',
        onEnter: batch =>
          gsap.to(batch, {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            ease: 'power3.out',
            stagger: 0.08,
            overwrite: true,
          }),
      });
    }, gridRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="landing-features">
      <div className="landing-features-head">
        <h2 className="landing-features-title">{t('landing.features_title')}</h2>
        <p className="landing-features-sub">{t('landing.features_sub')}</p>
      </div>

      <div ref={gridRef} className="landing-grid">
        {FEATURES.map(({ emoji, key }) => (
          <article key={key} className="landing-card">
            <span className="landing-card-emoji">{emoji}</span>
            <h3 className="landing-card-title">
              {t(`landing.cards.${key}.title`)}
            </h3>
            <p className="landing-card-text">{t(`landing.cards.${key}.text`)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

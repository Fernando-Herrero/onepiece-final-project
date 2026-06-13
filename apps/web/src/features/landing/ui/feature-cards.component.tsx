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
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
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
      const headChildren = headRef.current?.children;
      if (headChildren) {
        gsap.set(headChildren, { autoAlpha: 0, y: 40 });
      }

      ScrollTrigger.create({
        trigger: headRef.current,
        start: 'top 85%',
        onEnter: () => {
          if (!headChildren) return;
          gsap.to(headChildren, {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power3.out',
          });
        },
        once: true,
      });

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
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="features"
      ref={sectionRef}
      className="relative z-10 bg-gradient-to-b from-[#05070d] via-[#080d18] to-[#05070d] px-6 py-[clamp(5rem,12vh,10rem)] pb-[clamp(7rem,16vh,12rem)]"
    >
      <div
        ref={headRef}
        className="mx-auto mb-[clamp(3rem,8vh,6rem)] max-w-3xl text-center"
      >
        <h2 className="mb-4 font-[family-name:var(--font-one-piece)] text-[clamp(2rem,5vw,3.5rem)] tracking-wide text-[#f2d9a8]">
          {t('landing.features_title')}
        </h2>
        <p className="text-[clamp(1rem,2.2vw,1.2rem)] leading-relaxed text-[#f4ede1]/65">
          {t('landing.features_sub')}
        </p>
      </div>

      <div
        ref={gridRef}
        className="mx-auto flex max-w-6xl flex-wrap justify-center gap-5"
      >
        {FEATURES.map(({ emoji, key }) => (
          <article
            key={key}
            className="landing-card landing-card-shine relative max-w-[17rem] flex-[1_1_16rem] overflow-hidden rounded-2xl border border-[#f4ede1]/10 bg-gradient-to-br from-[#1b2742]/55 to-[#0b1120]/65 p-8 backdrop-blur-sm transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1.5 hover:border-[#f2d9a8]/35 hover:shadow-[0_24px_60px_rgba(0,0,0,0.45)]"
          >
            <span className="mb-4 block text-3xl">{emoji}</span>
            <h3 className="mb-3 font-[family-name:var(--font-road-captain)] text-xl tracking-wide text-[#f2d9a8]/90">
              {t(`landing.cards.${key}.title`)}
            </h3>
            <p className="text-[0.95rem] leading-relaxed text-[#f4ede1]/62">
              {t(`landing.cards.${key}.text`)}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

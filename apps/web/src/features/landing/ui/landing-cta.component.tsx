import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import { useTranslation } from 'next-i18next/pages';
import { useEffect, useRef } from 'react';

export function LandingCtaComponent() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      gsap.set(titleRef.current, { autoAlpha: 0, y: 50 });

      const actionButtons = actionsRef.current?.children;
      if (actionButtons) {
        gsap.set(actionButtons, { autoAlpha: 0, y: 50 });
      }

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 82%',
        onEnter: () => {
          gsap.to(titleRef.current, {
            autoAlpha: 1,
            y: 0,
            duration: 0.7,
            ease: 'power3.out',
          });
          if (actionButtons) {
            gsap.to(actionButtons, {
              autoAlpha: 1,
              y: 0,
              duration: 0.6,
              stagger: 0.12,
              ease: 'power3.out',
              delay: 0.15,
            });
          }
        },
        once: true,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative z-10 bg-[#05070d] px-6 pb-[clamp(6rem,14vh,10rem)] pt-4 text-center"
    >
      <h2
        ref={titleRef}
        className="mb-8 font-[family-name:var(--font-one-piece)] text-[clamp(2rem,5vw,3.5rem)] tracking-wide text-[#f2d9a8]"
      >
        {t('landing.cta_title')}
      </h2>
      <div
        ref={actionsRef}
        className="flex flex-wrap justify-center gap-4"
      >
        <Link
          href="/register"
          className="inline-flex min-w-44 items-center justify-center rounded-full bg-gradient-to-br from-[#f0713f] to-[#f5a261] px-8 py-3.5 font-[family-name:var(--font-road-captain)] text-base uppercase tracking-wider text-[#1a0f08] shadow-[0_12px_30px_rgba(240,113,63,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(240,113,63,0.5)]"
        >
          {t('home.register')}
        </Link>
        <Link
          href="/login"
          className="inline-flex min-w-44 items-center justify-center rounded-full border border-[#f4ede1]/30 px-8 py-3.5 font-[family-name:var(--font-road-captain)] text-base uppercase tracking-wider text-[#f4ede1] transition-all hover:-translate-y-0.5 hover:border-[#f2d9a8]/60"
        >
          {t('home.login')}
        </Link>
      </div>
    </section>
  );
}

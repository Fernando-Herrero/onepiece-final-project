import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTranslation } from 'next-i18next/pages';
import { type Ref, useEffect, useRef } from 'react';

import { isMotionDisabled } from '@/features/landing/motion/landing-motion';

const MASK_SCALE = 8;

function HeroImage({ imgRef }: { imgRef?: Ref<HTMLImageElement> }) {
  return (
    <picture>
      <source media="(max-width: 767px)" srcSet="/landing/hero-mobile.webp" />
      <img
        ref={imgRef}
        className="landing-img"
        src="/landing/hero.avif"
        alt=""
        aria-hidden="true"
      />
    </picture>
  );
}

export function HeroMaskComponent() {
  const { t } = useTranslation();
  const heroRef = useRef<HTMLElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const maskImgRef = useRef<HTMLImageElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const vignetteRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const scrollCueRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    const mask = maskRef.current;
    const maskImg = maskImgRef.current;
    const veil = veilRef.current;
    const vignette = vignetteRef.current;
    const title = titleRef.current;
    const tagline = taglineRef.current;
    const scrollCue = scrollCueRef.current;

    if (
      !hero ||
      !mask ||
      !maskImg ||
      !veil ||
      !vignette ||
      !title ||
      !tagline ||
      !scrollCue
    ) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Mobile/touch: the static hero is rendered entirely in CSS, so it paints
    // on first frame without waiting for this effect. Nothing to animate here.
    if (isMotionDisabled()) return;

    gsap.fromTo(
      scrollCue,
      { autoAlpha: 0, y: 20, filter: 'blur(10px)' },
      {
        autoAlpha: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 1.1,
        delay: 0.7,
        ease: 'power2.out',
      },
    );

    const ctx = gsap.context(() => {
      const proxy = { s: MASK_SCALE };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: '+=1800',
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        },
      });

      tl.to(
        proxy,
        {
          s: 1,
          duration: 1,
          ease: 'power2.inOut',
          onUpdate: () => {
            gsap.set(mask, { scale: proxy.s });
            gsap.set(maskImg, { scale: 1 / proxy.s });
          },
        },
        0,
      );

      tl.to(scrollCue, { autoAlpha: 0, duration: 0.12, ease: 'power1.out' }, 0);

      tl.fromTo(
        veil,
        { autoAlpha: 1 },
        { autoAlpha: 0, duration: 0.42, ease: 'power1.inOut' },
        0.12,
      );

      tl.to(
        vignette,
        { autoAlpha: 0.7, duration: 0.4, ease: 'power1.out' },
        0.22,
      );

      gsap.set(title, { clipPath: 'inset(0 0 100% 0)', y: 28 });

      tl.to(
        title,
        {
          autoAlpha: 1,
          clipPath: 'inset(0 0 0% 0)',
          y: 0,
          duration: 0.42,
          ease: 'power3.out',
        },
        0.55,
      );

      tl.fromTo(
        tagline,
        { autoAlpha: 0, y: 28, filter: 'blur(8px)' },
        {
          autoAlpha: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.34,
          ease: 'power2.out',
        },
        0.7,
      );
    }, hero);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} className="landing-hero">
      <div className="landing-bg" />

      <div ref={maskRef} className="landing-mask">
        <HeroImage imgRef={maskImgRef} />
      </div>

      <div ref={veilRef} className="landing-veil">
        <HeroImage />
      </div>

      <div ref={vignetteRef} className="landing-vignette" />
      <div className="landing-grain" />

      <h1 ref={titleRef} className="landing-title">
        LogPose
      </h1>
      <p ref={taglineRef} className="landing-tagline">
        {t('landing.tagline')}
      </p>

      <div ref={scrollCueRef} className="landing-scroll-cue">
        <span>{t('landing.scroll')}</span>
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M6 9l6 6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </section>
  );
}

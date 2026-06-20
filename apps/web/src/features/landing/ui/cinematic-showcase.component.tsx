import { Heading, Text } from '@radix-ui/themes';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import { useTranslation } from 'next-i18next/pages';
import { useEffect, useRef } from 'react';

import { isMotionDisabled } from '@/features/landing/motion/landing-motion';

export function CinematicShowcaseComponent() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const items = contentRef.current?.children;

    if (isMotionDisabled()) {
      if (items) gsap.set(items, { autoAlpha: 1, y: 0, clipPath: 'none' });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        bgRef.current,
        { yPercent: -10, scale: 1.2 },
        {
          yPercent: 10,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        },
      );

      if (items) {
        gsap.set(items, {
          autoAlpha: 0,
          y: 44,
          clipPath: 'inset(0 0 100% 0)',
        });

        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top 68%',
          once: true,
          onEnter: () =>
            gsap.to(items, {
              autoAlpha: 1,
              y: 0,
              clipPath: 'inset(0 0 0% 0)',
              duration: 0.9,
              stagger: 0.14,
              ease: 'power3.out',
            }),
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative z-10 flex min-h-[88vh] items-center overflow-hidden bg-[#05070d]"
    >
      <div ref={bgRef} className="absolute inset-0 -z-20 will-change-transform">
        <Image
          src="/landing/map/map-1024.webp"
          alt=""
          aria-hidden="true"
          fill
          sizes="100vw"
          className="object-cover opacity-50"
        />
      </div>

      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(80%_70%_at_50%_50%,rgba(5,7,13,0.25)_0%,rgba(5,7,13,0.78)_60%,#05070d_100%),linear-gradient(180deg,#05070d_0%,transparent_18%,transparent_82%,#05070d_100%)]"
      />
      <div className="landing-grain -z-10" aria-hidden="true" />

      <div
        ref={contentRef}
        className="mx-auto max-w-3xl px-6 text-center *:will-change-[transform,opacity]"
      >
        <Text
          as="p"
          size="1"
          className="font-road-captain mb-5 tracking-[0.4em] text-[#f2d9a8]/70 uppercase"
        >
          {t('landing.showcase.eyebrow')}
        </Text>
        <Heading
          as="h2"
          className="font-one-piece text-[clamp(2.4rem,7vw,5.5rem)] leading-[0.95] tracking-wide text-[#f2d9a8] [text-shadow:0_2px_0_#2a1c12,0_0_40px_rgba(220,150,70,0.3)]"
        >
          {t('landing.showcase.title')}
        </Heading>
        <Text
          as="p"
          size="3"
          className="mx-auto mt-7 max-w-xl leading-relaxed text-[#f4ede1]/80 md:text-lg"
        >
          {t('landing.showcase.text')}
        </Text>
      </div>
    </section>
  );
}

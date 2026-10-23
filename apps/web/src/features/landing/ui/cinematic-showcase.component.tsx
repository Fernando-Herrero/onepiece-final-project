import { Heading, Text } from '@radix-ui/themes';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import { useTranslation } from 'next-i18next/pages';
import { useRef } from 'react';

import { useGsapMotion } from '@/integrations/gsap/motion';

export function CinematicShowcaseComponent() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useGsapMotion(() => {
    const items = contentRef.current?.children;

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

  return (
    <section
      ref={sectionRef}
      className="bg-deep relative z-10 flex min-h-[88vh] items-center overflow-hidden"
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
        className="absolute inset-0 -z-10 bg-[radial-gradient(80%_70%_at_50%_50%,--alpha(var(--color-deep)/25%)_0%,--alpha(var(--color-deep)/78%)_60%,var(--color-deep)_100%),linear-gradient(180deg,var(--color-deep)_0%,transparent_18%,transparent_82%,var(--color-deep)_100%)]"
      />
      <div className="landing-grain -z-10" aria-hidden="true" />

      <div
        ref={contentRef}
        className="mx-auto max-w-3xl px-6 text-center *:will-change-[transform,opacity]"
      >
        <Text
          as="p"
          size="1"
          className="font-road-captain text-highlight/70 mb-5 tracking-[0.4em] uppercase"
        >
          {t('landing.showcase.eyebrow')}
        </Text>
        <Heading
          as="h2"
          className="font-one-piece text-highlight text-[clamp(2.4rem,7vw,5.5rem)] leading-[0.95] tracking-wide [text-shadow:0_2px_0_#2a1c12,0_0_40px_rgba(220,150,70,0.3)]"
        >
          {t('landing.showcase.title')}
        </Heading>
        <Text
          as="p"
          size="3"
          className="text-foreground/80 mx-auto mt-7 max-w-xl leading-relaxed md:text-lg"
        >
          {t('landing.showcase.text')}
        </Text>
      </div>
    </section>
  );
}

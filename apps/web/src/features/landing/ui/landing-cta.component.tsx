import { Button, Flex, Heading } from '@radix-ui/themes';
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
      <Heading
        ref={titleRef}
        as="h2"
        size="8"
        align="center"
        mb="6"
        className="font-[family-name:var(--font-one-piece)] tracking-wide text-[#f2d9a8]"
      >
        {t('landing.cta_title')}
      </Heading>
      <Flex
        ref={actionsRef}
        wrap="wrap"
        justify="center"
        gap="4"
        className="[&>*]:min-w-44"
      >
        <Button size="3" color="orange" asChild>
          <Link href="/register">{t('home.register')}</Link>
        </Button>
        <Button size="3" variant="outline" highContrast asChild>
          <Link href="/login">{t('home.login')}</Link>
        </Button>
      </Flex>
    </section>
  );
}

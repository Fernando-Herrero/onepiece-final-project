import { Button, Flex, Heading } from '@radix-ui/themes';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import { useTranslation } from 'next-i18next/pages';
import { type MouseEvent as ReactMouseEvent, useEffect, useRef } from 'react';

import { isMotionDisabled } from '@/features/landing/motion/landing-motion';

export function LandingCtaComponent() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const reduceMotionRef = useRef(false);

  const magnetize = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    if (reduceMotionRef.current) return;
    const el = event.currentTarget;
    const rect = el.getBoundingClientRect();
    const mx = event.clientX - (rect.left + rect.width / 2);
    const my = event.clientY - (rect.top + rect.height / 2);
    gsap.to(el, {
      x: mx * 0.3,
      y: my * 0.4,
      duration: 0.4,
      ease: 'power2.out',
    });
  };

  const demagnetize = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    gsap.to(event.currentTarget, {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: 'elastic.out(1, 0.4)',
    });
  };

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    reduceMotionRef.current = isMotionDisabled();

    if (reduceMotionRef.current) return;

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
      className="relative z-10 overflow-hidden bg-[#05070d] px-6 pt-[clamp(4rem,10vh,7rem)] pb-[clamp(6rem,14vh,10rem)] text-center"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_70%_at_50%_30%,rgba(220,150,70,0.16)_0%,transparent_60%)]"
      />
      <div className="landing-grain -z-10" aria-hidden="true" />

      <Heading
        ref={titleRef}
        as="h2"
        size="8"
        align="center"
        mb="6"
        className="font-one-piece tracking-wide text-[#f2d9a8] [text-shadow:0_0_36px_rgba(220,150,70,0.3)]"
      >
        {t('landing.cta_title')}
      </Heading>
      <Flex
        ref={actionsRef}
        wrap="wrap"
        justify="center"
        gap="4"
        className="`*:min-w-44"
      >
        <Button
          size="3"
          color="orange"
          asChild
          className="shadow-[0_0_36px_rgba(220,150,70,0.4)] transition-shadow duration-300 hover:shadow-[0_0_56px_rgba(220,150,70,0.6)]"
        >
          <Link
            href="/register"
            onMouseMove={magnetize}
            onMouseLeave={demagnetize}
          >
            {t('home.register')}
          </Link>
        </Button>
        <Button size="3" variant="outline" highContrast asChild>
          <Link href="/login">{t('home.login')}</Link>
        </Button>
      </Flex>
    </section>
  );
}

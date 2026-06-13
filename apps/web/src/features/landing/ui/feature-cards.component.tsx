import { Card, Flex, Heading, Text } from '@radix-ui/themes';
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

    if (prefersReduced) {
      gsap.set('.landing-card', { autoAlpha: 1, y: 0, scale: 1 });
      const headChildren = headRef.current?.children;
      if (headChildren) {
        gsap.set(headChildren, { autoAlpha: 1, y: 0 });
      }
      return;
    }

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
      className="relative z-10 bg-linear-to-b from-[#05070d] via-[#080d18] to-[#05070d] px-6 py-[clamp(5rem,12vh,10rem)] pb-[clamp(7rem,16vh,12rem)]"
    >
      <Flex
        ref={headRef}
        direction="column"
        align="center"
        gap="4"
        className="mx-auto mb-[clamp(3rem,8vh,6rem)] max-w-3xl text-center"
      >
        <Heading
          as="h2"
          size="8"
          align="center"
          className="font-one-piece tracking-wide text-[#f2d9a8]"
        >
          {t('landing.features_title')}
        </Heading>
        <Text
          as="p"
          size="4"
          color="gray"
          align="center"
          className="leading-relaxed"
        >
          {t('landing.features_sub')}
        </Text>
      </Flex>

      <Flex
        ref={gridRef}
        wrap="wrap"
        justify="center"
        gap="5"
        className="mx-auto max-w-6xl"
      >
        {FEATURES.map(({ emoji, key }) => (
          <Card
            key={key}
            size="3"
            className="landing-card landing-card-shine max-w-68 flex-[1_1_16rem] border border-[#f4ede1]/10 bg-linear-to-br from-[#1b2742]/55 to-[#0b1120]/65 backdrop-blur-sm transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1.5 hover:border-[#f2d9a8]/35 hover:shadow-[0_24px_60px_rgba(0,0,0,0.45)]"
          >
            <Flex direction="column" gap="3">
              <Text size="6">{emoji}</Text>
              <Heading
                as="h3"
                size="4"
                className="font-road-captain tracking-wide text-[#f2d9a8]/90"
              >
                {t(`landing.cards.${key}.title`)}
              </Heading>
              <Text as="p" size="2" color="gray" className="leading-relaxed">
                {t(`landing.cards.${key}.text`)}
              </Text>
            </Flex>
          </Card>
        ))}
      </Flex>
    </section>
  );
}

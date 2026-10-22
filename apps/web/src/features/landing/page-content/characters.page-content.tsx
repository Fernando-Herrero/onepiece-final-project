import { Button, Card, Flex, Grid, Heading, Text } from '@radix-ui/themes';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import { useTranslation } from 'next-i18next/pages';
import { useEffect, useRef, useState } from 'react';

import { CREW } from '@/features/help/help.constants';
import { isMotionDisabled } from '@/features/landing/motion/landing-motion';
import { CharacterCardComponent } from '@/features/landing/ui/character-card.component';
import { LandingPublicLayout } from '@/features/landing/ui/landing-public-layout.component';
import { Reveal } from '@/features/landing/ui/reveal.component';

const INITIAL_VISIBLE = 5;

export default function CharactersPageContent() {
  const { t } = useTranslation();
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const visibleCrew = CREW.slice(0, visibleCount);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (isMotionDisabled()) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>('.landing-card');
      gsap.set(cards, { autoAlpha: 0, y: 60, scale: 0.96 });

      ScrollTrigger.batch(cards, {
        start: 'top 90%',
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
    <LandingPublicLayout title={t('characters.meta_title')} wide>
      <section
        ref={sectionRef}
        className="flex w-full flex-col items-center gap-4 bg-cover bg-center bg-no-repeat pb-20"
        style={{
          backgroundImage:
            'url(/landing/characters/backgrounds/onepiece-japanese.webp)',
        }}
      >
        <Reveal>
          <Heading
            as="h1"
            size="7"
            mb="2"
            align="center"
            className="font-one-piece text-highlight tracking-wide"
          >
            {t('landing.nav.characters')}
          </Heading>
        </Reveal>

        <Grid
          columns={{ initial: '1', sm: '2', md: '3', lg: '2' }}
          gap="4"
          className="w-full justify-items-center lg:justify-items-stretch lg:overflow-visible"
        >
          {visibleCrew.map((char, index) => (
            <CharacterCardComponent
              key={char.name}
              name={char.name}
              text={t(`characters.${char.key}`)}
              images={char.images}
              isLast={index === visibleCrew.length - 1}
            />
          ))}
        </Grid>

        {visibleCount < CREW.length ? (
          <Card
            size="3"
            className="border-foreground/10 bg-page/80 mt-4 max-w-md border text-center backdrop-blur-sm"
          >
            <Flex direction="column" align="center" gap="3" p="4">
              <Text as="p" size="3" color="gray" className="leading-relaxed">
                {t('characters.final_text')}
              </Text>
              <Image
                src="/landing/characters/luffy-lies-main.webp"
                alt=""
                width={120}
                height={120}
                className="rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.4)]"
              />
              <Text as="p" size="2" color="gray" className="leading-relaxed">
                {t('characters.final_text_two')}
              </Text>
              <Button
                color="orange"
                onClick={() => setVisibleCount(CREW.length)}
              >
                {t('characters.view_more')}
              </Button>
            </Flex>
          </Card>
        ) : null}
      </section>
    </LandingPublicLayout>
  );
}

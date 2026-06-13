import { Button, Card, Flex, Heading, Text } from '@radix-ui/themes';
import { useTranslation } from 'next-i18next/pages';
import { useState } from 'react';

import { LandingPublicLayout } from '@/features/landing/ui/landing-public-layout.component';

const CREW = [
  { name: 'Monkey D. Luffy', key: 'luffy_text' },
  { name: 'Roronoa Zoro', key: 'zoro_text' },
  { name: 'Sanji', key: 'sanji_text' },
  { name: 'Nami', key: 'nami_text' },
  { name: 'Usopp', key: 'usopp_text' },
  { name: 'Tony Tony Chopper', key: 'chopper_text' },
  { name: 'Nico Robin', key: 'robin_text' },
  { name: 'Brook', key: 'brook_text' },
  { name: 'Jinbe', key: 'jimbe_text' },
] as const;

const INITIAL_VISIBLE = 5;

export default function CharactersPageContent() {
  const { t } = useTranslation();
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const visibleCrew = CREW.slice(0, visibleCount);

  return (
    <LandingPublicLayout title={t('characters.meta_title')}>
      <Heading
        as="h1"
        size="7"
        mb="6"
        align="center"
        className="font-one-piece tracking-wide text-[#f2d9a8]"
      >
        {t('landing.nav.characters')}
      </Heading>

      <Flex direction="column" gap="4">
        {visibleCrew.map(({ name, key }) => (
          <Card
            key={name}
            size="3"
            className="border border-[#f4ede1]/10 bg-linear-to-br from-[#1b2742]/55 to-[#0b1120]/65"
          >
            <Heading
              as="h2"
              size="4"
              mb="2"
              className="font-road-captain text-[#f2d9a8]/90"
            >
              {name}
            </Heading>
            <Text as="p" size="2" color="gray" className="leading-relaxed">
              {t(`characters.${key}`)}
            </Text>
          </Card>
        ))}
      </Flex>

      {visibleCount < CREW.length ? (
        <Card
          size="3"
          mt="6"
          className="border border-[#f4ede1]/10 bg-[#0b1120]/60 text-center"
        >
          <Flex direction="column" align="center" gap="3">
            <Text as="p" size="3" color="gray" className="leading-relaxed">
              {t('characters.final_text')}
            </Text>
            <Text as="p" size="2" color="gray" className="leading-relaxed">
              {t('characters.final_text_two')}
            </Text>
            <Button color="orange" onClick={() => setVisibleCount(CREW.length)}>
              {t('characters.view_more')}
            </Button>
          </Flex>
        </Card>
      ) : null}
    </LandingPublicLayout>
  );
}

import { Badge, Box, Card, Flex, Grid, Heading, Text } from '@radix-ui/themes';
import { gsap } from 'gsap';
import Link from 'next/link';
import { useTranslation } from 'next-i18next/pages';
import { useEffect, useRef } from 'react';

import { Icon } from '@/components/icons/icon';
import { isMotionDisabled } from '@/features/landing/motion/landing-motion';
import { useTilt } from '@/features/landing/motion/use-tilt';

const SETTINGS_MENU = [
  {
    id: 'security',
    icon: 'Lock',
    titleKey: 'settings.title_security',
    textKey: 'settings.text_security',
  },
  {
    id: 'monetisation',
    icon: 'Monetisation',
    titleKey: 'settings.title_monetisation',
    textKey: 'settings.text_monetisation',
  },
  {
    id: 'premium',
    icon: 'Star',
    titleKey: 'settings.title_premium',
    textKey: 'settings.text_premium',
  },
  {
    id: 'timeline',
    icon: 'Clock',
    titleKey: 'settings.title_timeline',
    textKey: 'settings.text_timeline',
  },
  {
    id: 'privacy',
    icon: 'ShieldCheck',
    titleKey: 'settings.title_privacy',
    textKey: 'settings.text_privacy',
    href: '/dashboard/settings/privacy',
  },
  {
    id: 'notifications',
    icon: 'Bell',
    titleKey: 'settings.title_notifications',
    textKey: 'settings.text_notifications',
  },
  {
    id: 'accessibility',
    icon: 'Accessibility',
    titleKey: 'settings.title_accessibility',
    textKey: 'settings.text_accessibility',
  },
  {
    id: 'resources',
    icon: 'BookOpen',
    titleKey: 'settings.title_resources',
    textKey: 'settings.text_resources',
  },
] as const;

function SettingsMenuIcon({
  name,
}: {
  name: (typeof SETTINGS_MENU)[number]['icon'];
}) {
  switch (name) {
    case 'Lock':
      return <Icon.Lock />;
    case 'Monetisation':
      return <Icon.Monetisation />;
    case 'Star':
      return <Icon.Star />;
    case 'Clock':
      return <Icon.Clock />;
    case 'ShieldCheck':
      return <Icon.ShieldCheck />;
    case 'Bell':
      return <Icon.Bell size={22} />;
    case 'Accessibility':
      return <Icon.Accessibility />;
    case 'BookOpen':
      return <Icon.BookOpen />;
  }
}

export default function SettingsPageContent() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const tilt = useTilt();

  useEffect(() => {
    const cards = sectionRef.current?.querySelectorAll<HTMLElement>(
      '.settings-hub-card',
    );
    if (!cards?.length) {
      return;
    }

    if (isMotionDisabled()) {
      gsap.set(cards, { autoAlpha: 1, y: 0, scale: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(cards, { autoAlpha: 0, y: 40, scale: 0.96 });
      gsap.to(cards, {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.65,
        stagger: 0.07,
        ease: 'power3.out',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="mx-auto max-w-3xl">
      <Heading
        as="h1"
        size="6"
        mb="2"
        className="font-one-piece tracking-wide text-[#f2d9a8]"
      >
        {t('dashboard.pages.settings.title')}
      </Heading>
      <Text as="p" size="2" mb="6" className="text-[#f4ede1]/75">
        {t('settings.subtitle')}
      </Text>

      <Grid columns={{ initial: '1', sm: '2' }} gap="3">
        {SETTINGS_MENU.map(item => {
          const isActive = 'href' in item;
          const cardClassName =
            'settings-hub-card flex h-full min-h-32 flex-col gap-3 border border-[#f2d9a8]/12 bg-linear-to-br from-[#1b2742]/50 to-[#0b1120]/70 p-4 backdrop-blur-sm transition-[border-color,box-shadow] duration-300';

          const content = (
            <>
              <Flex align="start" justify="between" gap="3">
                <Box className="rounded-lg border border-[#f2d9a8]/15 bg-[#05070d]/40 p-2 text-[#f2d9a8]">
                  <SettingsMenuIcon name={item.icon} />
                </Box>
                {!isActive ? (
                  <Badge
                    size="1"
                    color="gray"
                    variant="soft"
                    className="shrink-0"
                  >
                    {t('settings.coming_soon')}
                  </Badge>
                ) : null}
              </Flex>
              <Heading
                as="h2"
                size="3"
                className="font-road-captain tracking-wide text-[#f2d9a8]/90"
              >
                {t(item.titleKey)}
              </Heading>
              <Text
                as="p"
                size="2"
                className="leading-relaxed text-[#f4ede1]/65"
              >
                {t(item.textKey)}
              </Text>
            </>
          );

          if (isActive) {
            return (
              <Card
                key={item.id}
                asChild
                onMouseMove={tilt.onMouseMove}
                onMouseLeave={tilt.onMouseLeave}
                className={`${cardClassName} cursor-pointer hover:border-[#f2d9a8]/40 hover:shadow-[0_20px_50px_rgba(0,0,0,0.45)]`}
              >
                <Link href={item.href}>{content}</Link>
              </Card>
            );
          }

          return (
            <Card
              key={item.id}
              aria-disabled
              className={`${cardClassName} cursor-default opacity-80`}
            >
              {content}
            </Card>
          );
        })}
      </Grid>
    </section>
  );
}

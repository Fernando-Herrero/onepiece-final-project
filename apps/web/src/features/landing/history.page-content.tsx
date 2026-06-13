import { Heading, Link as RadixLink, Text } from '@radix-ui/themes';
import Link from 'next/link';
import { useTranslation } from 'next-i18next/pages';

import { LandingPublicLayout } from '@/features/landing/ui/landing-public-layout.component';

const HISTORY_SECTIONS = [
  { section: 'section_intro', content: 'content_intro' },
  { section: 'section_synopsis', content: 'content_synopsis' },
  { section: 'section_characters', charactersLink: true },
  {
    section: 'section_arcs',
    content: 'content_arcs',
    list: 'sub_content_arcs',
    listKeys: [
      'east_blue',
      'alabasta',
      'enies_lobby',
      'marineford',
      'dressrosa',
      'wano',
    ],
  },
  {
    section: 'section_world',
    content: 'content_world',
    list: 'sub_content_world',
    listKeys: ['grand_line', 'devil_fruits', 'organizations', 'treasure'],
  },
  {
    section: 'section_fun',
    content: 'content_fun',
    list: 'sub_content_fun',
    listKeys: ['longest_manga', 'secrets', 'inspiration'],
  },
] as const;

function HistoryListItems({
  section,
}: {
  section: (typeof HISTORY_SECTIONS)[number];
}) {
  const { t } = useTranslation();

  if (!('listKeys' in section)) return null;

  if (section.list === 'sub_content_arcs') {
    return (
      <ul className="list-disc space-y-1 pl-5">
        {section.listKeys.map(key => (
          <li key={key}>
            <Text as="span" size="2" color="gray">
              {t(`history.sub_content_arcs.${key}`)}
            </Text>
          </li>
        ))}
      </ul>
    );
  }

  if (section.list === 'sub_content_world') {
    return (
      <ul className="list-disc space-y-1 pl-5">
        {section.listKeys.map(key => (
          <li key={key}>
            <Text as="span" size="2" color="gray">
              {t(`history.sub_content_world.${key}`)}
            </Text>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className="list-disc space-y-1 pl-5">
      {section.listKeys.map(key => (
        <li key={key}>
          <Text as="span" size="2" color="gray">
            {t(`history.sub_content_fun.${key}`)}
          </Text>
        </li>
      ))}
    </ul>
  );
}

export default function HistoryPageContent() {
  const { t } = useTranslation();

  return (
    <LandingPublicLayout title={t('history.meta_title')}>
      <div className="rounded-xl border border-dashed border-[#a64242]/50 bg-[#0b1120]/40 p-6 shadow-lg">
        <Heading
          as="h1"
          size="7"
          mb="6"
          className="font-one-piece tracking-wide text-[#f2d9a8]"
        >
          {t('landing.nav.history')}
        </Heading>

        {HISTORY_SECTIONS.map(item => (
          <section key={item.section} className="mb-6 flex flex-col gap-2">
            <Heading
              as="h2"
              size="4"
              className="font-road-captain text-[#f2d9a8]/90 underline"
            >
              {t(`history.${item.section}`)}
            </Heading>

            {'charactersLink' in item ? (
              <RadixLink asChild highContrast>
                <Link
                  href="/characters"
                  className="inline-flex items-center gap-2 transition-transform hover:-translate-y-0.5"
                >
                  <span>→</span>
                  {t('history.section_characters')}
                  <span>←</span>
                </Link>
              </RadixLink>
            ) : (
              <Text as="p" size="2" color="gray" className="leading-relaxed">
                {t(`history.${item.content}`)}
              </Text>
            )}

            <HistoryListItems section={item} />
          </section>
        ))}
      </div>
    </LandingPublicLayout>
  );
}

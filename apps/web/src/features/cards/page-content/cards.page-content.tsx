import { Badge, Heading, Text } from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { useTranslation } from 'next-i18next/pages';
import { useState } from 'react';

import { allQueriesOptions } from '@/integrations/tanstack-query/queries-options';

const RARITY_CLASS: Record<string, string> = {
  common: 'border-white/20 bg-white/5',
  uncommon: 'border-emerald-400/40 bg-emerald-400/10',
  rare: 'border-sky-400/40 bg-sky-400/10',
  legendary:
    'border-amber-400/50 bg-amber-400/10 shadow-[0_0_24px_rgba(245,158,11,0.15)]',
};

export default function CardsPageContent() {
  const { t } = useTranslation();
  const [selectedCharacterId, setSelectedCharacterId] = useState<number | null>(
    null,
  );

  const charactersQuery = useQuery(allQueriesOptions.cards.charactersV2());
  const characterCardsQuery = useQuery(
    allQueriesOptions.cards.characterCardsV2(selectedCharacterId ?? 0),
  );

  const selectedCharacter = charactersQuery.data?.characters.find(
    character => character.id === selectedCharacterId,
  );

  return (
    <div className="mx-auto max-w-6xl">
      <Heading
        as="h1"
        size="6"
        mb="2"
        className="font-one-piece tracking-wide text-[#f2d9a8]"
      >
        {t('cards.title')}
      </Heading>
      <Text as="p" size="2" color="gray" mb="6" className="text-[#f4ede1]/75">
        {t('cards.subtitle')}
      </Text>

      {charactersQuery.isPending ? (
        <Text align="center" color="gray">
          {t('cards.loading')}
        </Text>
      ) : null}

      {charactersQuery.isError ? (
        <Text align="center" color="red">
          {charactersQuery.error instanceof Error
            ? charactersQuery.error.message
            : t('cards.error')}
        </Text>
      ) : null}

      {charactersQuery.data ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]">
          <section className="rounded-xl border border-[#f2d9a8]/15 bg-[#05070d]/50 p-4">
            <Heading as="h2" size="4" mb="4" className="text-[#f2d9a8]">
              {t('cards.characters_heading', {
                count: charactersQuery.data.total,
              })}
            </Heading>
            <ul className="space-y-2">
              {charactersQuery.data.characters.map(character => (
                <li key={character.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedCharacterId(character.id)}
                    className={`w-full rounded-lg px-3 py-2 text-left transition-colors ${
                      selectedCharacterId === character.id
                        ? 'bg-[#f2d9a8]/15 text-[#f2d9a8]'
                        : 'text-[#f4ede1]/85 hover:bg-white/5'
                    }`}
                  >
                    <Text as="span" size="2" weight="medium">
                      {character.name}
                    </Text>
                    {character.position ? (
                      <Text as="p" size="1" color="gray" className="mt-1">
                        {character.position}
                      </Text>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-[#f2d9a8]/15 bg-[#05070d]/50 p-4">
            <Heading as="h2" size="4" mb="4" className="text-[#f2d9a8]">
              {selectedCharacter
                ? t('cards.versions_heading', {
                    name: selectedCharacter.name,
                  })
                : t('cards.versions_placeholder')}
            </Heading>

            {!selectedCharacterId ? (
              <Text size="2" color="gray">
                {t('cards.select_character')}
              </Text>
            ) : null}

            {selectedCharacterId && characterCardsQuery.isPending ? (
              <Text size="2" color="gray">
                {t('cards.loading')}
              </Text>
            ) : null}

            {selectedCharacterId && characterCardsQuery.data ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {characterCardsQuery.data.cards.map(card => (
                  <article
                    key={card.id}
                    className={`overflow-hidden rounded-xl border p-3 ${RARITY_CLASS[card.rarity]}`}
                  >
                    <div className="relative mb-3 aspect-3/4 overflow-hidden rounded-lg bg-[#05070d]/60">
                      <Image
                        src={card.image}
                        alt={card.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 240px"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge color="orange" variant="soft" size="1">
                          {t(`cards.rarity.${card.rarity}`)}
                        </Badge>
                        <Text as="span" size="1" color="gray">
                          {t('cards.unlock_label', {
                            kind: card.unlock.kind,
                            id:
                              card.unlock.kind === 'episode'
                                ? card.unlock.episodeId
                                : card.unlock.kind === 'arc'
                                  ? card.unlock.arcId
                                  : card.unlock.eventId,
                          })}
                        </Text>
                      </div>
                      <Text
                        as="p"
                        size="2"
                        weight="medium"
                        className="text-[#f4ede1]"
                      >
                        {card.title}
                      </Text>
                      {card.description ? (
                        <Text
                          as="p"
                          size="1"
                          color="gray"
                          className="line-clamp-3"
                        >
                          {card.description}
                        </Text>
                      ) : null}
                      {card.bounty !== undefined ? (
                        <Text as="p" size="1" className="text-[#f2d9a8]/90">
                          {t('cards.bounty', {
                            value: card.bounty.toLocaleString(),
                          })}
                        </Text>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
          </section>
        </div>
      ) : null}
    </div>
  );
}

import { describe, expect, it } from 'vitest';

import { normalizeResearch } from './normalize-research.js';

const noRewards = {
  characters: [],
  items: [],
  fruits: [],
  swords: [],
  boats: [],
};

// Entrada en desorden a propósito: sagas, arcos y episodios fuera de su orden.
// `episodeRange` de Loguetown (45–53) contiene al de Buggy (46–47), como en los datos reales.
// En alabasta, el arco de `order` 1 tiene episodios más altos que el de `order` 2.
const buildInput = () => [
  {
    slug: 'alabasta',
    order: 2,
    title: { en: 'Alabasta', ja: 'アラバスタ編' },
    episodeRange: { first: 80, last: 92 },
    arcs: [
      {
        slug: 'little-garden',
        sagaSlug: 'alabasta',
        order: 2,
        title: {
          es: 'Jardín Pequeño',
          en: 'Little Garden',
          ja: 'リトルガーデン編',
        },
        type: 'canon',
        chapters: [],
        episodes: [
          { number: 80, title: { en: '80 en', ja: '80 ja' }, canon: 'canon' },
        ],
      },
      {
        slug: 'whisky-peak',
        sagaSlug: 'alabasta',
        order: 1,
        title: { en: 'Whisky Peak' },
        summary: {
          es: 'Whisky Peak resumen es',
          en: 'Whisky Peak summary en',
          ja: 'ウイスキーピーク要約',
        },
        type: 'filler',
        episodes: [
          {
            number: 92,
            title: { es: '92 es', en: '92 en' },
            summary: {
              es: '92 resumen es',
              en: '92 summary en',
              ja: '92 要約',
            },
          },
          { number: 91, title: { en: '91 en' } },
        ],
      },
    ],
  },
  {
    slug: 'east-blue',
    order: 1,
    title: { es: 'East Blue', en: 'East Blue', ja: 'イーストブルー編' },
    chapterRange: { first: 1, last: 100 },
    sources: [{ url: 'https://example.test', field: 'title' }],
    arcs: [
      {
        slug: 'loguetown',
        sagaSlug: 'east-blue',
        order: 7,
        title: { es: 'Loguetown', en: 'Loguetown', ja: 'ローグタウン編' },
        summary: {
          es: 'Loguetown resumen es',
          en: 'Loguetown summary en',
          ja: 'ローグタウン要約',
        },
        type: 'mixed',
        episodeRange: { first: 45, last: 53 },
        episodes: [
          { number: 53, title: { es: '53 es', en: '53 en', ja: '53 ja' } },
          {
            number: 45,
            title: { es: '¡Recompensa!', en: 'Bounty!', ja: '賞金首！' },
            summary: { es: 'Resumen 45 es', en: 'Summary 45 en', ja: '要約45' },
            adaptsChapters: [96, 97],
          },
          { number: 48, title: { en: 'Episode 48 en', ja: '第48話' } },
        ],
      },
      {
        slug: 'buggy-side-story',
        sagaSlug: 'east-blue',
        order: 6,
        title: { en: 'Buggy Side Story', ja: 'バギー一味冒険記' },
        type: 'mixed',
        chapterRange: null,
        episodeRange: { first: 46, last: 47 },
        episodes: [
          {
            number: 47,
            title: { es: '47 es', en: '47 en', ja: '47 ja' },
            summary: {
              es: '47 resumen es',
              en: '47 summary en',
              ja: '47 要約',
            },
          },
          { number: 46, title: { en: '46 en', ja: '46 ja' } },
        ],
      },
    ],
  },
];

describe('normalizeResearch', () => {
  it('devuelve exactamente sagas, arcs, episodes y locales', () => {
    const result = normalizeResearch(buildInput());

    expect(Object.keys(result).sort()).toEqual([
      'arcs',
      'episodes',
      'locales',
      'sagas',
    ]);
    expect(Object.keys(result.locales).sort()).toEqual(['en', 'es', 'ja']);
  });

  it('ordena las sagas por su order, no por el orden de entrada', () => {
    expect(normalizeResearch(buildInput()).sagas).toStrictEqual([
      { slug: 'east-blue', totalArcs: 2, totalEpisodes: 5 },
      { slug: 'alabasta', totalArcs: 2, totalEpisodes: 3 },
    ]);
  });

  it('ordena los arcos por el order de su saga y luego por su order, no por su primer episodio', () => {
    expect(normalizeResearch(buildInput()).arcs).toStrictEqual([
      {
        slug: 'buggy-side-story',
        sagaSlug: 'east-blue',
        type: 'mixed',
        totalEpisodes: 2,
      },
      {
        slug: 'loguetown',
        sagaSlug: 'east-blue',
        type: 'mixed',
        totalEpisodes: 3,
      },
      {
        slug: 'whisky-peak',
        sagaSlug: 'alabasta',
        type: 'filler',
        totalEpisodes: 2,
      },
      {
        slug: 'little-garden',
        sagaSlug: 'alabasta',
        type: 'canon',
        totalEpisodes: 1,
      },
    ]);
  });

  it('ordena los episodios por número ascendente', () => {
    const numbers = normalizeResearch(buildInput()).episodes.map(e => e.number);

    expect(numbers).toStrictEqual([45, 46, 47, 48, 53, 80, 91, 92]);
  });

  it('asigna cada episodio al arco donde aparece, no al que lo contiene por episodeRange', () => {
    const arcOf = Object.fromEntries(
      normalizeResearch(buildInput()).episodes.map(e => [e.number, e.arcSlug]),
    );

    expect(arcOf).toStrictEqual({
      45: 'loguetown',
      46: 'buggy-side-story',
      47: 'buggy-side-story',
      48: 'loguetown',
      53: 'loguetown',
      80: 'little-garden',
      91: 'whisky-peak',
      92: 'whisky-peak',
    });
  });

  it('da 500 de experiencia al último episodio de cada arco y 100 al resto', () => {
    const experience = Object.fromEntries(
      normalizeResearch(buildInput()).episodes.map(e => [
        e.number,
        e.experience,
      ]),
    );

    expect(experience).toStrictEqual({
      45: 100,
      46: 100,
      47: 500,
      48: 100,
      53: 500,
      80: 500,
      91: 100,
      92: 500,
    });
  });

  it('deja rewards vacío en todos los episodios y sin más campos', () => {
    const { episodes } = normalizeResearch(buildInput());

    expect(episodes).toHaveLength(8);
    for (const episode of episodes) {
      expect(episode.rewards).toStrictEqual(noRewards);
      expect(Object.keys(episode).sort()).toEqual([
        'arcSlug',
        'experience',
        'number',
        'rewards',
      ]);
    }
  });

  it('genera el locale es con fallback a title.en y description solo si hay summary', () => {
    expect(normalizeResearch(buildInput()).locales.es).toStrictEqual({
      sagas: {
        'east-blue': { name: 'East Blue', nameJa: 'イーストブルー編' },
        alabasta: { name: 'Alabasta', nameJa: 'アラバスタ編' },
      },
      arcs: {
        'buggy-side-story': { name: 'Buggy Side Story' },
        loguetown: { name: 'Loguetown', description: 'Loguetown resumen es' },
        'whisky-peak': {
          name: 'Whisky Peak',
          description: 'Whisky Peak resumen es',
        },
        'little-garden': { name: 'Jardín Pequeño' },
      },
      episodes: {
        45: { name: '¡Recompensa!', description: 'Resumen 45 es' },
        46: { name: '46 en' },
        47: { name: '47 es', description: '47 resumen es' },
        48: { name: 'Episode 48 en' },
        53: { name: '53 es' },
        80: { name: '80 en' },
        91: { name: '91 en' },
        92: { name: '92 es', description: '92 resumen es' },
      },
    });
  });

  it('genera el locale en con title.en y summary.en', () => {
    expect(normalizeResearch(buildInput()).locales.en).toStrictEqual({
      sagas: {
        'east-blue': { name: 'East Blue', nameJa: 'イーストブルー編' },
        alabasta: { name: 'Alabasta', nameJa: 'アラバスタ編' },
      },
      arcs: {
        'buggy-side-story': { name: 'Buggy Side Story' },
        loguetown: { name: 'Loguetown', description: 'Loguetown summary en' },
        'whisky-peak': {
          name: 'Whisky Peak',
          description: 'Whisky Peak summary en',
        },
        'little-garden': { name: 'Little Garden' },
      },
      episodes: {
        45: { name: 'Bounty!', description: 'Summary 45 en' },
        46: { name: '46 en' },
        47: { name: '47 en', description: '47 summary en' },
        48: { name: 'Episode 48 en' },
        53: { name: '53 en' },
        80: { name: '80 en' },
        91: { name: '91 en' },
        92: { name: '92 en', description: '92 summary en' },
      },
    });
  });

  it('genera el locale ja con title.ja y fallback a title.en cuando falta', () => {
    expect(normalizeResearch(buildInput()).locales.ja).toStrictEqual({
      sagas: {
        'east-blue': { name: 'イーストブルー編', nameJa: 'イーストブルー編' },
        alabasta: { name: 'アラバスタ編', nameJa: 'アラバスタ編' },
      },
      arcs: {
        'buggy-side-story': { name: 'バギー一味冒険記' },
        loguetown: { name: 'ローグタウン編', description: 'ローグタウン要約' },
        'whisky-peak': {
          name: 'Whisky Peak',
          description: 'ウイスキーピーク要約',
        },
        'little-garden': { name: 'リトルガーデン編' },
      },
      episodes: {
        45: { name: '賞金首！', description: '要約45' },
        46: { name: '46 ja' },
        47: { name: '47 ja', description: '47 要約' },
        48: { name: '第48話' },
        53: { name: '53 ja' },
        80: { name: '80 ja' },
        91: { name: '91 en' },
        92: { name: '92 en', description: '92 要約' },
      },
    });
  });

  it('no crea la clave description cuando el arco o el episodio no trae summary', () => {
    const { locales } = normalizeResearch(buildInput());

    for (const locale of [locales.es, locales.en, locales.ja]) {
      expect('description' in locale.arcs['buggy-side-story']!).toBe(false);
      expect('description' in locale.episodes[46]!).toBe(false);
    }
  });

  it('lanza si un mismo número de episodio aparece en dos arcos', () => {
    const arc = (slug: string, order: number) => ({
      slug,
      order,
      title: { en: slug },
      type: 'canon',
      episodes: [{ number: 46, title: { en: 'Episode 46' } }],
    });
    const input = [
      {
        slug: 'east-blue',
        order: 1,
        title: { en: 'East Blue', ja: 'イーストブルー編' },
        arcs: [arc('buggy-side-story', 6), arc('loguetown', 7)],
      },
    ];

    expect(() => normalizeResearch(input)).toThrow(/46/);
  });

  it.each([
    [
      'un arco con type fuera de canon/filler/mixed',
      (input: ReturnType<typeof buildInput>) => {
        (input[1]!.arcs[0]!.type as string) = 'special';
      },
    ],
    [
      'una saga sin slug',
      (input: ReturnType<typeof buildInput>) => {
        delete (input[0] as Partial<(typeof input)[0]>).slug;
      },
    ],
  ])('lanza si la entrada no cumple el schema: %s', (_, corrupt) => {
    const input = buildInput();
    corrupt(input);

    expect(() => normalizeResearch(input)).toThrow();
  });

  it('lanza si la entrada no es un array de sagas', () => {
    expect(() => normalizeResearch({})).toThrow();
    expect(() => normalizeResearch(null)).toThrow();
  });
});

import type {
  SerieEpisodeAchievements,
  SerieProgress,
} from '@/features/serie/serie.types';

/** Suma XP de `apps/api/src/data/serie/episodes.json` (semilla actual). */
export const SERIE_TOTAL_XP = 8900;

export const DEFAULT_SERIE_PROGRESS: SerieProgress = {
  saga: 0,
  arc: 0,
  episode: 0,
};

export const SERIE_ACHIEVEMENT_TYPES = [
  { key: 'characters', labelKey: 'profile.collection_characters' },
  { key: 'items', labelKey: 'profile.collection_items' },
  { key: 'fruits', labelKey: 'profile.collection_fruits' },
  { key: 'swords', labelKey: 'profile.collection_swords' },
  { key: 'boats', labelKey: 'profile.collection_boats' },
] as const satisfies ReadonlyArray<{
  key: keyof SerieEpisodeAchievements;
  labelKey:
    | 'profile.collection_characters'
    | 'profile.collection_items'
    | 'profile.collection_fruits'
    | 'profile.collection_swords'
    | 'profile.collection_boats';
}>;

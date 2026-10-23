import { SERIE_TOTAL_XP } from '@/features/serie/serie.constants';

export function getSerieXpPercent(experience: number) {
  return Math.min(100, Math.round((experience / SERIE_TOTAL_XP) * 100));
}

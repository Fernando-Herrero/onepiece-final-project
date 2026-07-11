import { z } from 'zod';

import type { serieProgressSchema } from './user.schemas.js';

export const AVATAR_CHARACTER_IDS = [
  'luffy',
  'zoro',
  'nami',
  'sanji',
  'usopp',
  'chopper',
  'robin',
  'brook',
  'jimbe',
] as const;

export type AvatarCharacterId = (typeof AVATAR_CHARACTER_IDS)[number];

/** East Blue crew — selectable at register and always in the profile picker. */
export const AVATAR_STARTER_CHARACTER_IDS = [
  'luffy',
  'zoro',
  'nami',
  'sanji',
  'usopp',
] as const satisfies readonly AvatarCharacterId[];

export type AvatarStarterCharacterId =
  (typeof AVATAR_STARTER_CHARACTER_IDS)[number];

/** Unlocked via `serieProgress` (dashboard profile only). */
export const AVATAR_PROGRESS_UNLOCK_CHARACTER_IDS = [
  'chopper',
  'robin',
  'brook',
  'jimbe',
] as const satisfies readonly AvatarCharacterId[];

export type AvatarProgressUnlockCharacterId =
  (typeof AVATAR_PROGRESS_UNLOCK_CHARACTER_IDS)[number];

export type SerieProgress = {
  saga: number;
  arc: number;
  episode: number;
};

export type AvatarOption = {
  id: AvatarCharacterId;
  path: string;
  previewPath: string;
};

const AVATAR_BASE = '/avatars';

function avatarPath(id: AvatarCharacterId): string {
  return `${AVATAR_BASE}/${id}/${id}-happy-400.webp`;
}

function avatarPreviewPath(id: AvatarCharacterId): string {
  return `${AVATAR_BASE}/${id}/${id}-serious-400.webp`;
}

export const AVATAR_OPTIONS: AvatarOption[] = AVATAR_CHARACTER_IDS.map(id => ({
  id,
  path: avatarPath(id),
  previewPath: avatarPreviewPath(id),
}));

export const avatarPathSchema = z.enum(
  AVATAR_OPTIONS.map(option => option.path) as [string, ...string[]],
  { message: 'Avatar no válido' },
);

export const registerAvatarPathSchema = z.enum(
  AVATAR_STARTER_CHARACTER_IDS.map(id => avatarPath(id)) as [
    string,
    ...string[],
  ],
  { message: 'Avatar no válido para registro' },
);

/**
 * Minimum serie progress per unlockable avatar.
 * Fill when B3 (completeEpisode server-side) ships — see docs/MIGRATION.md § Avatares.
 */
export const AVATAR_PROGRESS_UNLOCK_RULES = {} as Partial<
  Record<AvatarProgressUnlockCharacterId, SerieProgress>
>;

function isSerieProgressAtLeast(
  current: SerieProgress,
  required: SerieProgress,
): boolean {
  if (current.saga !== required.saga) {
    return current.saga > required.saga;
  }
  if (current.arc !== required.arc) {
    return current.arc > required.arc;
  }
  return current.episode >= required.episode;
}

export function getProgressUnlockedAvatarIds(
  serieProgress: SerieProgress,
): AvatarProgressUnlockCharacterId[] {
  return AVATAR_PROGRESS_UNLOCK_CHARACTER_IDS.filter(id => {
    const rule = AVATAR_PROGRESS_UNLOCK_RULES[id];
    return rule !== undefined && isSerieProgressAtLeast(serieProgress, rule);
  });
}

export function getSelectableAvatarIds(
  serieProgress: SerieProgress,
): AvatarCharacterId[] {
  return [
    ...AVATAR_STARTER_CHARACTER_IDS,
    ...getProgressUnlockedAvatarIds(serieProgress),
  ];
}

export function getRegisterAvatarPickerOptions(): AvatarOption[] {
  return AVATAR_OPTIONS.filter(option =>
    (AVATAR_STARTER_CHARACTER_IDS as readonly AvatarCharacterId[]).includes(
      option.id,
    ),
  );
}

export function getProfileAvatarPickerOptions(
  serieProgress: SerieProgress,
  currentAvatarPath?: string,
): AvatarOption[] {
  const ids = new Set(getSelectableAvatarIds(serieProgress));

  if (currentAvatarPath) {
    const current = AVATAR_OPTIONS.find(
      option => option.path === currentAvatarPath,
    );
    if (current) {
      ids.add(current.id);
    }
  }

  return AVATAR_OPTIONS.filter(option => ids.has(option.id));
}

export function isAvatarPathSelectable(
  path: string,
  serieProgress: SerieProgress,
  currentAvatarPath?: string,
): boolean {
  return getProfileAvatarPickerOptions(serieProgress, currentAvatarPath).some(
    option => option.path === path,
  );
}

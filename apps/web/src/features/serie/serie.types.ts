import {
  arcSchema,
  episodeSchema,
  sagaSchema,
} from '@logpose/contracts/common/serie.schemas';
import {
  serieProgressSchema,
  unlockedCardsSchema,
} from '@logpose/contracts/common/user.schemas';
import type * as z from 'zod/v4';

export type SerieSaga = z.infer<typeof sagaSchema>;

export type SerieArc = z.infer<typeof arcSchema>;

export type SerieEpisode = z.infer<typeof episodeSchema>;

export type SerieProgress = z.infer<typeof serieProgressSchema>;

export type SerieEpisodeAchievements = z.infer<typeof unlockedCardsSchema>;

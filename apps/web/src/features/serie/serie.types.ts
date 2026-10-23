import {
  arcSchema,
  episodeSchema,
  sagaSchema,
} from '@logpose/contracts/common/serie.schemas';
import type * as z from 'zod/v4';

export type SerieSaga = z.infer<typeof sagaSchema>;

export type SerieArc = z.infer<typeof arcSchema>;

export type SerieEpisode = z.infer<typeof episodeSchema>;

export type SerieEpisodeRewards = SerieEpisode['rewards'];

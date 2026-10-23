import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type {
  arcSchema,
  episodeSchema,
  sagaSchema,
} from '@logpose/contracts/common/serie.schemas';
import type * as z from 'zod/v4';

type Saga = z.infer<typeof sagaSchema>;
type Arc = z.infer<typeof arcSchema>;
type Episode = z.infer<typeof episodeSchema>;

const serieDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../data/serie',
);

let sagasCache: Saga[] | null = null;
let arcsCache: Arc[] | null = null;
let episodesCache: Episode[] | null = null;

function loadJsonFile<T>(fileName: string) {
  const filePath = path.join(serieDir, fileName);
  return JSON.parse(readFileSync(filePath, 'utf8')) as T;
}

export function getSagasData() {
  if (!sagasCache) {
    sagasCache = loadJsonFile<Saga[]>('sagas.json');
  }

  return sagasCache;
}

export function getArcsData() {
  if (!arcsCache) {
    arcsCache = loadJsonFile<Arc[]>('arcs.json');
  }

  return arcsCache;
}

export function getEpisodesData() {
  if (!episodesCache) {
    episodesCache = loadJsonFile<Episode[]>('episodes.json');
  }

  return episodesCache;
}

export function getSagaBySlug(sagaSlug: string) {
  return getSagasData().find(saga => saga.slug === sagaSlug);
}

export function getArcBySlug(arcSlug: string) {
  return getArcsData().find(arc => arc.slug === arcSlug);
}

export function getEpisodeByNumber(episodeNumber: number) {
  return getEpisodesData().find(episode => episode.number === episodeNumber);
}

export function getArcsBySagaSlug(sagaSlug: string) {
  return getArcsData().filter(arc => arc.sagaSlug === sagaSlug);
}

export function getEpisodesByArcSlug(arcSlug: string) {
  return getEpisodesData().filter(episode => episode.arcSlug === arcSlug);
}

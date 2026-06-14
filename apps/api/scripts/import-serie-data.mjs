/**
 * import-serie-data.mjs — one-shot legacy → monorepo (serie cronology)
 *
 * Reads sagas.js, arcs.js, episodes.js from One-piece-LogPose serieData and writes
 * normalized JSON to apps/api/src/data/serie/.
 *
 * Run once when updating from legacy; committed JSON is the source of truth at runtime.
 *
 * Legacy path:
 *   .../One-piece-LogPose/src/dashboard/data/serieData/
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const legacyDir =
  '/Users/fernandoherrero/Documents/master-programacion/5-REACT/PROYECTOS/One-piece-LogPose/src/dashboard/data/serieData';
const outputDir = path.join(__dirname, '../src/data/serie');

const SAGA_ALIASES = {
  'Thriller Bark': 'Thriller Bark Saga',
  'Summit War': 'Summit War Saga',
  'Fish-Man Island': 'Fishman Island',
  Dessrosa: 'Dressrosa',
  Wano: 'Wano Country',
};

function loadLegacyExport(file, exportName) {
  const content = fs.readFileSync(path.join(legacyDir, file), 'utf8');
  const cleaned = content.replace(/^export const /gm, 'const ');
  return new Function(`${cleaned}; return ${exportName};`)();
}

function isFillerArc(name) {
  return /\(Filler\)/i.test(name);
}

function normalizeSagas(raw) {
  return raw.map(saga => ({
    id: saga.saga_id,
    name: saga.name,
    titleJa: saga.japaneseName,
    totalEpisodes: saga.total_episodes,
    firstArc: saga.first_arc,
    lastArc: saga.last_arc,
    arcNames: saga.arcs,
  }));
}

function normalizeArcs(raw, sagas) {
  const sagaByName = new Map(sagas.map(saga => [saga.name, saga.id]));

  return raw.map(arc => {
    const sagaKey = SAGA_ALIASES[arc.saga] ?? arc.saga;
    const sagaId = sagaByName.get(sagaKey);

    if (sagaId === undefined) {
      throw new Error(`Arc "${arc.name}": unknown saga "${arc.saga}"`);
    }

    const normalized = {
      id: arc.arc_id,
      name: arc.name,
      description: arc.description,
      saga: arc.saga,
      sagaId,
      totalEpisodes: arc.total_episodes,
      isFiller: isFillerArc(arc.name),
    };

    if (arc.first_episode !== undefined) {
      normalized.firstEpisode = arc.first_episode;
    }

    if (arc.last_episode !== undefined) {
      normalized.lastEpisode = arc.last_episode;
    }

    return normalized;
  });
}

function normalizeEpisodes(raw) {
  return raw.map(episode => ({
    id: episode.episode_id,
    name: episode.name,
    description: episode.description,
    arc: episode.arc,
    experience: episode.experience,
    achievements: episode.achievements,
  }));
}

function writeJson(name, data) {
  fs.writeFileSync(
    path.join(outputDir, name),
    `${JSON.stringify(data, null, 2)}\n`,
    'utf8',
  );
  console.log(`Wrote ${name} (${data.length} entries)`);
}

fs.mkdirSync(outputDir, { recursive: true });

const sagas = normalizeSagas(loadLegacyExport('sagas.js', 'sagas'));
const arcs = normalizeArcs(loadLegacyExport('arcs.js', 'arcs'), sagas);
const episodes = normalizeEpisodes(loadLegacyExport('episodes.js', 'episodes'));

writeJson('sagas.json', sagas);
writeJson('arcs.json', arcs);
writeJson('episodes.json', episodes);

console.log('Done.');

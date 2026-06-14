/**
 * build-catalog.mjs — script de migración one-shot (legacy v2 → monorepo v3)
 *
 * Por qué existe:
 * El catálogo de cartas vivía en One-piece-LogPose como módulos JS
 * (`src/dashboard/data/serieData/*.js`) con imports de imágenes Vite.
 * Este script los convirtió a JSON estático en `apps/api/src/data/catalog/`.
 *
 * Qué hace (truco one-shot):
 * 1. Lee cada .js del legacy
 * 2. Regex sobre `import X from "@/assets/images/cards/..."` → paths públicos
 * 3. Quita imports, evalúa el array con `new Function`, renombra `*_id` → `id`
 * 4. Escribe characters.json, items.json, fruits.json, swords.json, boats.json
 *
 * Por qué lo mantengo:
 * Referencia de cómo se hizo la primera importación. Hoy la API lee los JSON
 * con `catalog.ts`; no hace falta ejecutarlo salvo que actualices el legacy.
 *
 * Nota sobre paths (el código de abajo NO lo cambies):
 * Este script sigue escribiendo `/assets/images/cards/...` como en la primera
 * pasada (reflejo del alias Vite `@/assets/images/cards/` del legacy). En el
 * monorepo ya simplificamos a `/cards/...` en los JSON y las imágenes viven
 * en `apps/web/public/cards/`. Si algún día lo vuelves a ejecutar, tendrás
 * que sustituir ese prefijo en los JSON generados o ajustarlos a mano.
 *
 * Origen legacy (ruta de la máquina donde se generó):
 *   .../One-piece-LogPose/src/dashboard/data/serieData/
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const legacyDir =
  '/Users/fernandoherrero/Documents/master-programacion/5-REACT/PROYECTOS/One-piece-LogPose/src/dashboard/data/serieData';
const outputDir = path.join(__dirname, '../src/data/catalog');

const files = [
  { file: 'characters.js', exportName: 'characters', idField: 'character_id' },
  { file: 'items.js', exportName: 'items', idField: 'item_id' },
  { file: 'fruits.js', exportName: 'fruits', idField: 'fruit_id' },
  { file: 'swords.js', exportName: 'swords', idField: 'sword_id' },
  { file: 'boats.js', exportName: 'boats', idField: 'boat_id' },
];

function convertFile({ file, exportName, idField }) {
  let content = fs.readFileSync(path.join(legacyDir, file), 'utf8');
  const imageMap = {};

  for (const match of content.matchAll(
    /import (\w+) from ["']@\/assets\/images\/cards\/([^"']+)["']/g,
  )) {
    imageMap[match[1]] = `/assets/images/cards/${match[2]}`;
  }

  content = content.replace(/^import .+$/gm, '');
  content = content.replace(/^export const /gm, 'const ');

  for (const [varName, imgPath] of Object.entries(imageMap)) {
    content = content.replaceAll(`image: ${varName}`, `image: "${imgPath}"`);
  }

  const data = new Function(`${content}; return ${exportName};`)();

  return data.map(item => {
    const { [idField]: legacyId, ...rest } = item;
    return { id: legacyId, ...rest };
  });
}

fs.mkdirSync(outputDir, { recursive: true });

for (const config of files) {
  const cards = convertFile(config);
  const outName = `${config.exportName}.json`;
  fs.writeFileSync(
    path.join(outputDir, outName),
    `${JSON.stringify(cards, null, 2)}\n`,
  );
  console.log(`Wrote ${outName} (${cards.length} cards)`);
}

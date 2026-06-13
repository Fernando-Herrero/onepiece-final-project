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

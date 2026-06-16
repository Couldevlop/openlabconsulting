// Rasterise les graphiques SVG (data-viz) en PNG pour upload Media (les SVG
// bruts ne sont pas uploadés en Media — sécurité OWASP). Usage :
//   node scripts/seo/rasterize-charts.mjs
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const dir = join(root, 'public', 'insights', 'charts');

// [nom de fichier (sans extension), largeur cible px]
const charts = [
  ['adoption-gen-ia-afrique', 760],
  ['marche-ia-afrique', 1200],
  ['valeur-gen-ia-secteurs', 1200],
];

for (const [name, width] of charts) {
  const src = join(dir, `${name}.svg`);
  const out = join(dir, `${name}.png`);
  // density élevée = rendu net du SVG avant resize.
  await sharp(src, { density: 220 })
    .resize({ width })
    .png({ quality: 90 })
    .toFile(out);
  console.log(`✓ ${name}.png (${width}px)`);
}
console.log('Rasterisation terminée.');

/**
 * npm run plate — regenerate the static 2D plates in public/atlas/.
 *
 * The interactive app builds its 2D view on the fly from the same meshes, but
 * shipping a few flat SVG plates means the README, a worksheet or a slide can
 * carry the figure without running anything.
 *
 *   node scripts/plate.mjs [--views front,back,left] [--variants female,male]
 *                          [--systems surface] [--out public/atlas]
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildHumanoid } from '../src/scene/humanoid.js';
import { buildPlate, plateLabels, plateToSVG } from '../src/atlas/plate.js';
import { PART_BY_ID } from '../src/data/index.js';

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const views = arg('views', 'front,back,left').split(',');
const variants = arg('variants', 'female,male').split(',');
const systems = arg('systems', 'surface').split(',');
const outDir = arg('out', 'public/atlas');
mkdirSync(outDir, { recursive: true });

for (const variant of variants) {
  const human = buildHumanoid(variant);
  human.root.updateMatrixWorld(true);
  for (const view of views) {
    const t0 = Date.now();
    const plate = buildPlate(human, {
      view,
      isVisible: (m) => systems.includes(m.userData.system) && (PART_BY_ID[m.userData.partId]?.minLevel ?? 1) <= 5,
    });
    const labels = plateLabels(plate, { systems: new Set(systems) });
    const svg = plateToSVG(plate, {
      height: 1100,
      title: `HumanBody · ${view} view`,
      subtitle: `${variant} figure · ${systems.join(' + ')} · generated from the 3D model`,
      labels,
    });
    const file = join(outDir, variants.length > 1 ? `plate-${view}-${variant}.svg` : `plate-${view}.svg`);
    writeFileSync(file, svg);
    console.log(
      `${file}  ${plate.regions.length} regions · ${labels.length} labels · ${Date.now() - t0} ms · ${(svg.length / 1024).toFixed(0)} KB`
    );
  }
}
console.log('\nSVG is a standalone image: open it in a browser, drop it in a slide, or import it into Inkscape/Illustrator.');

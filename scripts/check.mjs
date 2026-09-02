/**
 * Atlas self-check: `npm run check`
 *
 * Validates the content and the 3D model without a browser:
 *  - every entry has the five depth tiers and a resolvable level
 *  - every mesh, tour step, alias and search result resolves to a real part
 *  - every level shows something in 3D, and quizzes can be generated
 *  - geometry sanity: no broken numbers, and internal structures stay inside the body
 *
 * Exit code 1 on failure, so it can run in CI.
 */
import fs from 'node:fs';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { buildHumanoid } from '../src/scene/humanoid.js';
import { ClinicalAnatomy, CLINICAL_ASSETS } from '../src/scene/clinical-models.js';
import { REFERENCE_PLATES } from '../src/atlas/reference.js';
import { ALL_PARTS, PART_BY_ID, SYSTEM_BY_ID, partsForLevel, searchParts, ATLAS_STATS } from '../src/data/index.js';
import { LEVELS, bestDetailFor } from '../src/data/levels.js';
import { SYSTEMS } from '../src/data/systems.js';
import { makeQuestions } from '../src/quiz.js';
import { TOURS } from '../src/data/tours.js';
import {
  BODY_TREE, buildTree, treeIssues, partIdsUnder, systemsUnder, pathToPart, trailLabel,
} from '../src/data/tree.js';
import { buildPlate, plateLabels, plateToSVG } from '../src/atlas/plate.js';

let problems = 0;
const fail = (msg) => { console.log('  ✗ ' + msg); problems++; };
const pass = (msg, extra = '') => console.log(`  ✓ ${msg}${extra ? ' — ' + extra : ''}`);

const bboxOf = (meshes) => {
  const b = new THREE.Box3();
  for (const m of meshes) m.updateWorldMatrix(true, false), b.union(new THREE.Box3().setFromObject(m));
  return b;
};

console.log('\n📚 Content');
for (const p of ALL_PARTS) {
  if (!p.id || !p.name) fail('part missing id or name');
  if (!SYSTEM_BY_ID[p.system]) fail(`${p.id}: unknown system "${p.system}"`);
  if (!p.details?.basic) fail(`${p.id}: missing the basic (Class 1–5) tier`);
  for (const lvl of LEVELS) if (!bestDetailFor(p, lvl.id)) fail(`${p.id}: no text usable at level ${lvl.id}`);
}
const ids = ALL_PARTS.map((p) => p.id);
const dupes = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
if (dupes.length) fail(`duplicate part ids: ${dupes.join(', ')}`);
else pass(`${ATLAS_STATS.parts} entries across ${ATLAS_STATS.systems} systems, all with level-appropriate text`);

console.log('\n🌲 Body-part tree');
{
  const { unknown, duplicates, unfiled } = treeIssues();
  if (unknown.length) fail(`tree names ids that are not in the atlas: ${unknown.join(', ')}`);
  if (duplicates.length) fail(`part filed under more than one branch: ${duplicates.join(', ')}`);
  if (unfiled.length) fail(`parts missing from the tree: ${unfiled.join(', ')}`);

  // shape: region → branch → part, unique node ids, nothing empty
  const seenIds = new Set();
  const empty = [];
  for (const region of BODY_TREE) {
    if (seenIds.has(region.id)) fail(`duplicate node id ${region.id}`);
    seenIds.add(region.id);
    if (!region.icon || !region.blurb) fail(`region ${region.id} needs an icon and a blurb`);
    if ((region.children || []).length < 2) fail(`region ${region.id} should hold at least two branches`);
    if ((region.parts || []).length) fail(`region ${region.id} files parts directly; put them in a branch`);
    for (const branch of region.children || []) {
      if (seenIds.has(branch.id)) fail(`duplicate node id ${branch.id}`);
      seenIds.add(branch.id);
      if (branch.children?.length) fail(`branch ${branch.id} has children — the tree is two levels deep`);
      if ((branch.parts || []).length < 2) empty.push(branch.id);
    }
  }
  if (empty.length) fail(`branches with a single part (worse than a flat list): ${empty.join(', ')}`);

  // every entry resolves to a trail, and every level's counts add up
  for (const p of ALL_PARTS) {
    const trail = pathToPart(p.id);
    if (trail.length !== 2) fail(`${p.id}: expected a region and a branch in the tree, got ${trail.length}`);
    else if (trailLabel(p.id).split(' › ').length !== 2) fail(`${p.id}: broken trail label`);
    for (const sys of systemsUnder(trail[0].id)) if (!SYSTEM_BY_ID[sys]) fail(`${trail[0].id}: unknown system ${sys}`);
  }
  for (const lv of LEVELS) {
    const tree = buildTree({ level: lv.id });
    const open = tree.reduce((n, r) => n + r.count, 0);
    const total = tree.reduce((n, r) => n + r.count + r.lockedCount, 0);
    const expectedOpen = partsForLevel(lv.id).length;
    if (total !== ALL_PARTS.length) fail(`level ${lv.id}: tree files ${total} of ${ALL_PARTS.length} entries`);
    if (open !== expectedOpen) fail(`level ${lv.id}: tree offers ${open} parts, the atlas has ${expectedOpen}`);
    if (!tree.length) fail(`level ${lv.id}: empty tree`);
  }

  // a branch really can scope a quiz on its own
  const scopeIds = new Set(partIdsUnder('hn-brain'));
  const scoped = makeQuestions({ level: 3, partIds: [...scopeIds], count: 8 });
  if (scoped.length < 8) fail(`branch quiz: only ${scoped.length}/8 questions`);
  if (scoped.some((q) => !scopeIds.has(q.part.id))) fail('branch quiz drifted outside the branch');
  pass(`${BODY_TREE.length} regions · ${seenIds.size - BODY_TREE.length} branches · all ${ALL_PARTS.length} entries filed once, quizzes scope to a branch`);
}

console.log('\n🔍 Search');
for (const q of ['heart', 'femur', 'nephron', 'mitochondria']) {
  const r = searchParts(q, 5);
  if (!r.length) fail(`search "${q}" found nothing`);
  else console.log(`  · "${q}" → ${r.slice(0, 3).map((p) => p.name).join(', ')}`);
}
pass('search returns hits for common terms');

console.log('\n🧍 3D model');
const human = buildHumanoid('female');
human.root.updateMatrixWorld(true);
const meshParts = new Set(human.allMeshes.map((m) => m.userData.partId));
for (const m of human.allMeshes) {
  if (!PART_BY_ID[m.userData.partId]) fail(`mesh points at unknown part "${m.userData.partId}"`);
  if (!SYSTEM_BY_ID[m.userData.system]) fail(`mesh part ${m.userData.partId}: unknown system ${m.userData.system}`);
}
let nan = 0;
human.root.traverse((m) => {
  if (!m.isMesh) return;
  const a = m.geometry.attributes.position.array;
  for (let i = 0; i < a.length; i++) if (!Number.isFinite(a[i])) { nan++; break; }
});
if (nan) fail(`${nan} meshes contain NaN vertices`);
pass(`${human.allMeshes.length} meshes covering ${meshParts.size} parts, no NaN geometry`);

const skin = bboxOf(human.byPart.get('skin') || []);
const outside = [];
for (const [id, meshes] of human.byPart) {
  const part = PART_BY_ID[id];
  if (!part || id === 'skin') continue;
  // microscopic models (cells, nephron, placenta …) are shown at their own magnified scale
  if (human.resolveMicroModel(id)) continue;
  const b = bboxOf(meshes);
  if (b.min.x < skin.min.x - 0.02 || b.max.x > skin.max.x + 0.02 ||
      b.min.y < skin.min.y - 0.02 || b.max.y > skin.max.y + 0.02 ||
      b.min.z < skin.min.z - 0.02 || b.max.z > skin.max.z + 0.02) outside.push(id);
}
if (outside.length) fail(`structures poking outside the skin: ${outside.join(', ')}`);
else pass('every internal structure sits inside the body envelope');

console.log('\n✦ Clinical source assets');
{
  // Parse and combine the exact files that the browser loads. This catches a
  // missing public asset, incompatible GLB attribute layout, or a source name
  // mapping to an atlas id that does not exist before it reaches a learner.
  const clinicalHuman = {
    root: new THREE.Group(), variant: 'male', skin: 'light',
    reindex: () => {},
  };
  const clinical = new ClinicalAnatomy(clinicalHuman);
  const loader = new GLTFLoader();
  for (const asset of Object.values(CLINICAL_ASSETS)) {
    const file = new URL(`../public/models/clinical/${asset.file}`, import.meta.url);
    if (!fs.existsSync(file)) {
      fail(`clinical asset missing: ${asset.file}`);
      continue;
    }
    try {
      const binary = fs.readFileSync(file);
      const buffer = binary.buffer.slice(binary.byteOffset, binary.byteOffset + binary.byteLength);
      const gltf = await new Promise((resolve, reject) => loader.parse(buffer, '', resolve, reject));
      clinical.integrate(asset, gltf.scene);
    } catch (error) {
      fail(`clinical asset ${asset.file} did not parse/integrate: ${error.message}`);
    }
  }
  const clinicalMeshes = [];
  clinicalHuman.referenceRoot.traverse((object) => { if (object.isMesh) clinicalMeshes.push(object); });
  const unknown = [...clinicalHuman.referencePartSources.keys()].filter((id) => !PART_BY_ID[id]);
  const withoutPartAttribute = clinicalMeshes.filter((mesh) => !mesh.geometry.getAttribute('clinicalPart'));
  const wrongSystem = clinicalMeshes.flatMap((mesh) => (mesh.userData.referencePartIds || [])
    // `skin` is deliberately displayed in the app's Body Surface & Regions
    // layer, although its educational text entry lives in Integumentary.
    .filter((id) => PART_BY_ID[id] && PART_BY_ID[id].system !== mesh.userData.system
      && !(id === 'skin' && mesh.userData.system === 'surface'))
    .map((id) => `${id}→${mesh.userData.system}`));
  if (unknown.length) fail(`clinical mapping uses unknown atlas ids: ${unknown.join(', ')}`);
  if (wrongSystem.length) fail(`clinical mapping puts parts in the wrong system: ${wrongSystem.join(', ')}`);
  if (withoutPartAttribute.length) fail(`${withoutPartAttribute.length} clinical composite(s) lack exact-pick data`);
  for (const id of ['skin', 'femur', 'biceps', 'spinal-cord', 'heart', 'lungs', 'lymph-nodes']) {
    if (!clinicalHuman.referencePart(id)) fail(`clinical source has no mapped ${id} geometry`);
  }
  clinicalHuman.root.updateMatrixWorld(true);
  const clinicalBox = new THREE.Box3().setFromObject(clinicalHuman.referenceRoot);
  if (clinicalBox.isEmpty() || clinicalBox.min.y > -0.86 || clinicalBox.max.y < 0.85) {
    fail('clinical source body is not aligned to the teaching scene frame');
  }
  if (!unknown.length && !withoutPartAttribute.length && clinicalMeshes.length) {
    pass(`${clinicalMeshes.length} source composites / ${clinicalHuman.referencePartSources.size} mapped parts parse and align`);
  }

  for (const plate of Object.values(REFERENCE_PLATES)) {
    const file = new URL(`../public/${plate.src.replace(/^\.\//, '')}`, import.meta.url);
    if (!fs.existsSync(file) || fs.statSync(file).size < 1024) fail(`reference plate unavailable: ${plate.src}`);
    if (!plate.attribution || !plate.license || !plate.sourceUrl) fail(`reference plate missing credit metadata: ${plate.id}`);
  }
  pass(`${Object.keys(REFERENCE_PLATES).length} licensed 2D reference plates are bundled with metadata`);
}

console.log('\n🔬 Micro view');
for (const p of ALL_PARTS.filter((p) => p.system === 'micro')) {
  if (!human.resolveMicroModel(p.id)) fail(`micro part "${p.id}" has no model`);
}
pass(`${human.microModels.size} microscopic models, all micro entries covered`);

console.log('\n🎓 Levels');
for (const lv of LEVELS) {
  const parts = partsForLevel(lv.id);
  const withMesh = parts.filter((p) => meshParts.has(p.id));
  if (!withMesh.length) fail(`level ${lv.id} would show an empty 3D scene`);
  else console.log(`  · ${lv.short.padEnd(10)} ${String(parts.length).padStart(3)} entries, ${withMesh.length} with 3D geometry`);
}

console.log('\n🎯 Quiz');
for (const lv of LEVELS) {
  const qs = makeQuestions({ level: lv.id, count: 8 });
  if (qs.length < 8) fail(`level ${lv.id}: only ${qs.length}/8 questions generated`);
  if (qs.some((q) => q.options.some((o) => !o || o === '—') || q.answer < 0)) fail(`level ${lv.id}: empty options or missing answer`);
}
pass('8 well-formed questions at every level');

console.log('\n🎒 Tours');
for (const [lvl, tour] of Object.entries(TOURS)) {
  for (const step of tour.steps) {
    if (step.partId && !PART_BY_ID[step.partId]) fail(`tour ${lvl}: unknown part ${step.partId}`);
    if (step.systems) for (const s of step.systems) if (!SYSTEM_BY_ID[s]) fail(`tour ${lvl}: unknown system ${s}`);
  }
  console.log(`  · level ${lvl}: ${tour.steps.length} steps`);
}

console.log('\n🖼 2D plate');
{
  const allSystems = new Set(SYSTEMS.map((x) => x.id));
  for (const variant of ['female', 'male']) {
    const human = buildHumanoid(variant);
    human.root.updateMatrixWorld(true);
    for (const view of ['front', 'back', 'left']) {
      const mk = (systems, level) => buildPlate(human, {
        view,
        isVisible: (m) => systems.has(m.userData.system) && (PART_BY_ID[m.userData.partId]?.minLevel ?? 1) <= level,
      });
      const flat = mk(new Set(['surface']), 1);
      const deep = mk(allSystems, 5);
      if (flat.regions.length < 20) fail(`${variant}/${view}: only ${flat.regions.length} surface regions projected`);
      if (deep.regions.length < 120) fail(`${variant}/${view}: only ${deep.regions.length} regions with every system on`);
      for (const r of deep.regions) {
        if (!r.d || r.d.startsWith('M') === false || /NaN|Infinity|undefined/.test(r.d)) {
          fail(`${variant}/${view}: broken path for part ${r.partId}`);
          break;
        }
        if (!PART_BY_ID[r.partId]) { fail(`${variant}/${view}: region for unknown part ${r.partId}`); break; }
        if (Math.abs(r.centroid[0]) > 0.45 || r.centroid[1] < -1.05 || r.centroid[1] > 1.1) {
          fail(`${variant}/${view}: ${r.partId} projects outside the body`);
          break;
        }
      }
      const labels = plateLabels(deep, { systems: allSystems });
      if (labels.length > 20) fail(`${variant}/${view}: ${labels.length} labels — the plate would be unreadable`);
      if (labels.some((l) => !l.name)) fail(`${variant}/${view}: label without a name`);
      const svg = plateToSVG(flat, { labels: plateLabels(flat, { systems: new Set(['surface']) }) });
      if (/NaN|undefined/.test(svg) || svg.length < 2000) fail(`${variant}/${view}: broken SVG export`);
    }
  }
  pass('every view projects a clean, labelled plate for both body types');
}

console.log(problems ? `\n❌ ${problems} problem(s) found\n` : '\n✅ All atlas checks passed\n');
process.exit(problems ? 1 : 0);

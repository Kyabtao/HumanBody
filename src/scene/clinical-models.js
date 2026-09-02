/**
 * clinical-models.js — source-derived clinical anatomy meshes.
 *
 * The teaching meshes in the original atlas remain available as a small,
 * immediate fallback. This module upgrades each macroscopic layer as soon as
 * its bundled GLB arrives with decimated geometry derived from BodyParts3D /
 * Z-Anatomy. The source meshes are in one common, standing-body coordinate
 * system, so layers line up without guessing positions in JavaScript.
 *
 * Licence and attribution for the binary assets live in public/ATTRIBUTION.md.
 * Do not remove that notice when redistributing files in
 * public/models/clinical/.
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { SKIN_TONES } from './anatomy.js';

// The Z-Anatomy system exports stand 1.70 m high with feet at y = 0. The
// teaching scene spans y = -0.90 → +0.90, so this makes the two coordinate
// frames meet exactly at the ground plane.
const CLINICAL_SCALE = 1.06;
const CLINICAL_Y = -0.90;

const PART_COLOURS = {
  skull: '#e8e2d5', mandible: '#e5dfd2', 'cervical-vertebrae': '#e8e2d5',
  'thoracic-vertebrae': '#e8e2d5', 'lumbar-vertebrae': '#e8e2d5', sacrum: '#d9d1c0',
  ribs: '#eee8dc', sternum: '#f3ede1', clavicle: '#eee8dc', scapula: '#e8e2d5',
  humerus: '#e8e2d5', radius: '#e8e2d5', ulna: '#e8e2d5', 'hand-bones': '#eee8dc',
  pelvis: '#e8e2d5', femur: '#e8e2d5', patella: '#f2ebdd', tibia: '#e8e2d5',
  fibula: '#e8e2d5', 'foot-bones': '#eee8dc', joints: '#9db8bb', cartilage: '#b7d5d2',

  'muscle-overview': '#a9453b', pectoralis: '#bb4b42', deltoid: '#b8473f', biceps: '#c15247',
  triceps: '#aa3e39', 'forearm-muscles': '#b6483e', 'abdominal-muscles': '#d85a4c',
  diaphragm: '#be5b52', trapezius: '#9e3734', 'latissimus-dorsi': '#a53d38',
  'gluteal-muscles': '#ae433e', quadriceps: '#bd4b42', hamstrings: '#a8403b',
  'calf-muscles': '#b4463e', tendon: '#dbc9ad',

  brain: '#d6be8e', cerebrum: '#d7bd8a', cerebellum: '#c9aa78', brainstem: '#b89671',
  thalamus: '#d4b178', hypothalamus: '#cda66e', pituitary: '#c18ca5', 'spinal-cord': '#e7ca81',
  'peripheral-nerves': '#dfc874', autonomic: '#d9b96d', eye: '#7fb6c9', ear: '#c7b27b',
  nose: '#d5aa83', tongue: '#d57a70', meninges: '#a9b0c6',

  heart: '#ba3438', 'heart-chambers': '#a92f35', 'heart-valves': '#e5c7b3',
  arteries: '#d14842', veins: '#4e7da8', aorta: '#d8443e', 'vena-cava': '#5479a4',
  coronary: '#e05b50', capillaries: '#bb6f70',

  lungs: '#d88791', trachea: '#b7d3dc', bronchi: '#a6c4cf', larynx: '#b7cdd1',
  pharynx: '#d08d83', 'nasal-cavity': '#c46c72', pleura: '#a9c9d0',
  mouth: '#cf887c', oesophagus: '#d1887d', stomach: '#c77d70',
  'small-intestine': '#d4a278', 'large-intestine': '#b78365', liver: '#963f38',
  gallbladder: '#719760', pancreas: '#d8a578', 'salivary-glands': '#c98c97',
  peritoneum: '#d9c9ae', kidney: '#a74c57', ureter: '#d6a1a3', bladder: '#e2b2ad',
  urethra: '#d59ea2', adrenal: '#d2a25b', thyroid: '#bc728f', parathyroid: '#d5b073',
  'pancreas-islets': '#d9a76d', pineal: '#b989b6', thymus: '#b79487',
  gonads: '#d27e92', uterus: '#d68ea0', 'sperm-path': '#cf8794',
  'lymph-nodes': '#94bd98', spleen: '#8b4a65', 'lymph-vessels': '#9dcfa3',
  tonsils: '#b3829a', 'bone-marrow': '#c56562',
};

const DEFAULT_COLOURS = {
  surface: '#e8b98f', skeletal: '#e9e6dc', muscular: '#b8473f', nervous: '#d7c78a',
  cardiovascular: '#d6413c', respiratory: '#e2969a', digestive: '#c98a4b',
  urinary: '#7fa8c9', endocrine: '#b98ac9', lymphatic: '#8fbf9a', reproductive: '#d68ba0',
};

const SYSTEM_ASSETS = {
  surface: ['surface'],
  skeletal: ['skeletal', 'joints'],
  muscular: ['muscular'],
  // The full organ export contains the source tongue used by the existing
  // nervous/senses atlas entry.
  nervous: ['nervous', 'organs'],
  cardiovascular: ['cardiovascular'],
  respiratory: ['organs'],
  digestive: ['organs'],
  urinary: ['organs'],
  // The Z-Anatomy lymph export includes the thymus, an endocrine organ.
  endocrine: ['organs', 'lymphatic'],
  lymphatic: ['lymphatic'],
  reproductive: ['organs'],
};

const same = (system, partId, extra = {}) => ({ system, partId, ...extra });
// GLTFLoader preserves source words but replaces spaces with underscores and
// strips laterality punctuation (for example `Central_canal'`). Normalise that
// transport-safe spelling before matching the actual anatomical labels.
const clean = (name = '') => String(name).toLowerCase()
  .replace(/[’']/g, '')
  .replace(/_/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();
const has = (name, ...terms) => terms.some((term) => name.includes(term));

function mapSurface() {
  return same('surface', 'skin');
}

function mapSkeleton(name) {
  const n = clean(name);
  if (has(n, 'mandible')) return same('skeletal', 'mandible');
  if (has(n, 'cervical vertebra', 'vertebra c', 'atlas', 'axis')) return same('skeletal', 'cervical-vertebrae');
  if (has(n, 'thoracic vertebra', 'vertebra t')) return same('skeletal', 'thoracic-vertebrae');
  if (has(n, 'lumbar vertebra', 'vertebra l')) return same('skeletal', 'lumbar-vertebrae');
  if (has(n, 'sacrum', 'coccyx')) return same('skeletal', 'sacrum');
  if (has(n, 'costal cartilage', 'articular cartilage', 'intervertebral disk', 'intervertebral disc')) return same('skeletal', 'cartilage');
  if (has(n, 'rib')) return same('skeletal', 'ribs');
  if (has(n, 'sternum', 'manubrium', 'xiphoid')) return same('skeletal', 'sternum');
  if (has(n, 'clavicle')) return same('skeletal', 'clavicle');
  if (has(n, 'scapula')) return same('skeletal', 'scapula');
  if (has(n, 'humerus')) return same('skeletal', 'humerus');
  if (has(n, 'radius')) return same('skeletal', 'radius');
  if (has(n, 'ulna')) return same('skeletal', 'ulna');
  if (has(n, 'femur')) return same('skeletal', 'femur');
  if (has(n, 'patella')) return same('skeletal', 'patella');
  if (has(n, 'tibia')) return same('skeletal', 'tibia');
  if (has(n, 'fibula')) return same('skeletal', 'fibula');
  if (has(n, 'hip bone', 'ilium', 'ischium', 'pubis', 'pubic')) return same('skeletal', 'pelvis');
  if (has(n, 'metatars', 'calcaneus', 'cuboid', 'cuneiform', 'navicular', 'talus', 'finger of foot', 'toe', 'sesamoid bones of foot')) return same('skeletal', 'foot-bones');
  if (has(n, 'metacarp', 'carpal', 'finger of hand', 'scaphoid', 'lunate', 'triquetr', 'pisiform', 'trapez', 'capitate', 'hamate')) return same('skeletal', 'hand-bones');
  if (has(n, 'frontal bone', 'parietal', 'occipital', 'sphenoid', 'ethmoid', 'temporal bone', 'maxilla', 'zygomatic', 'lacrimal', 'nasal bone', 'palatine', 'vomer', 'skull', 'cranium', 'tooth', 'teeth', 'hyoid')) return same('skeletal', 'skull');
  return same('skeletal', 'joints');
}

function mapJoints(name) {
  const n = clean(name);
  if (has(n, 'cartilage', 'meniscus', 'disc', 'labrum')) return same('skeletal', 'cartilage');
  return same('skeletal', 'joints');
}

function mapMuscle(name) {
  const n = clean(name);
  if (has(n, 'biceps femoris', 'semitendinos', 'semimembranos')) return same('muscular', 'hamstrings');
  if (has(n, 'triceps surae', 'gastrocnem', 'soleus', 'tibialis', 'fibularis', 'perone')) return same('muscular', 'calf-muscles');
  if (has(n, 'rectus femoris', 'vastus', 'quadriceps')) return same('muscular', 'quadriceps');
  if (has(n, 'glute', 'piriformis', 'obturator', 'gemellus')) return same('muscular', 'gluteal-muscles');
  if (has(n, 'latissimus dorsi')) return same('muscular', 'latissimus-dorsi');
  if (has(n, 'trapezius')) return same('muscular', 'trapezius');
  if (has(n, 'diaphragm')) return same('muscular', 'diaphragm');
  if (has(n, 'rectus abdominis', 'oblique', 'transversus abdominis', 'linea alba')) return same('muscular', 'abdominal-muscles');
  if (has(n, 'flexor', 'extensor', 'pronator', 'supinator', 'brachioradialis', 'palmar', 'anconeus')) return same('muscular', 'forearm-muscles');
  if (has(n, 'triceps')) return same('muscular', 'triceps');
  if (has(n, 'biceps', 'brachialis', 'coracobrachialis')) return same('muscular', 'biceps');
  if (has(n, 'deltoid')) return same('muscular', 'deltoid');
  if (has(n, 'pector')) return same('muscular', 'pectoralis');
  if (has(n, 'tendon', 'aponeurosis')) return same('muscular', 'tendon');
  return same('muscular', 'muscle-overview');
}

function mapNervous(name) {
  const n = clean(name);
  if (has(n, 'cerebell')) return same('nervous', 'cerebellum');
  if (has(n, 'brain stem', 'pons', 'medulla oblongata', 'midbrain')) return same('nervous', 'brainstem');
  if (has(n, 'thalam')) return same('nervous', 'thalamus');
  if (has(n, 'hypothalam')) return same('nervous', 'hypothalamus');
  if (has(n, 'pituitary', 'hypophysis')) return same('nervous', 'pituitary');
  if (has(n, 'mening', 'dura', 'arachnoid', 'pia mater')) return same('nervous', 'meninges');
  if (has(n, 'spinal cord', 'central canal', 'cauda equina')) return same('nervous', 'spinal-cord');
  if (has(n, 'eyeball', 'retina', 'cornea', 'iris', 'lens')) return same('nervous', 'eye');
  if (has(n, 'cochlear', 'vestibular', 'ear')) return same('nervous', 'ear');
  if (has(n, 'olfactory')) return same('nervous', 'nose');
  if (has(n, 'tongue')) return same('nervous', 'tongue');
  if (has(n, 'cerebr', 'frontal lobe', 'parietal lobe', 'temporal lobe', 'occipital lobe', 'gyrus', 'cortex')) return same('nervous', 'cerebrum');
  if (has(n, 'sympathetic', 'parasympathetic', 'autonomic')) return same('nervous', 'autonomic');
  return same('nervous', 'peripheral-nerves');
}

function mapCardiovascular(name) {
  const n = clean(name);
  if (has(n, 'atrium', 'ventricle', 'wall of heart', 'heart muscle', 'myocard', 'papillary', 'chordae', 'trabecula')) return same('cardiovascular', 'heart');
  if (has(n, 'valve', 'leaflet', 'annulus')) return same('cardiovascular', 'heart-valves');
  if (has(n, 'coronary')) return same('cardiovascular', 'coronary');
  if (has(n, 'vena cava')) return same('cardiovascular', 'vena-cava');
  if (has(n, 'aorta', 'aortic')) return same('cardiovascular', 'aorta');
  if (has(n, 'capillar')) return same('cardiovascular', 'capillaries');
  if (has(n, 'vein', 'venous', 'sinus')) return same('cardiovascular', 'veins');
  // The remaining source structures are named arterial branches, even when
  // their English label is abbreviated or unavailable in the export.
  return same('cardiovascular', 'arteries');
}

function mapOrgans(name) {
  const n = clean(name);
  // The source's whole-body organ export includes one male reproductive atlas.
  if (has(n, 'testis', 'penis', 'corpus cavernosum', 'corpus spongiosum', 'glans')) return same('reproductive', 'gonads', { sex: 'male' });
  if (has(n, 'epididym', 'deferens', 'ejaculatory', 'prostate', 'seminal')) return same('reproductive', 'sperm-path', { sex: 'male' });

  if (has(n, 'kidney', 'renal pelvis')) return same('urinary', 'kidney');
  if (has(n, 'ureter')) return same('urinary', 'ureter');
  if (has(n, 'bladder')) return same('urinary', 'bladder');
  if (has(n, 'urethra')) return same('urinary', 'urethra');

  if (has(n, 'suprarenal', 'adrenal')) return same('endocrine', 'adrenal');
  if (has(n, 'pituitary', 'adenohypophysis', 'neurohypophysis')) return same('endocrine', 'pituitary');
  if (has(n, 'parathyroid')) return same('endocrine', 'parathyroid');
  if (has(n, 'thyroid')) return same('endocrine', 'thyroid');
  if (has(n, 'pineal')) return same('endocrine', 'pineal');
  if (has(n, 'thymus')) return same('endocrine', 'thymus');

  if (has(n, 'bronch')) return same('respiratory', 'bronchi');
  if (has(n, 'lung', 'pleura')) return same('respiratory', 'lungs');
  if (has(n, 'trachea')) return same('respiratory', 'trachea');
  if (has(n, 'larynx', 'epiglottis')) return same('respiratory', 'larynx');
  if (has(n, 'pharynx')) return same('respiratory', 'pharynx');
  if (has(n, 'nasal')) return same('respiratory', 'nasal-cavity');

  if (has(n, 'oesophagus', 'esophagus')) return same('digestive', 'oesophagus');
  if (has(n, 'stomach')) return same('digestive', 'stomach');
  if (has(n, 'jejunum', 'ileum', 'duodenum', 'small intestine')) return same('digestive', 'small-intestine');
  if (has(n, 'colon', 'appendix', 'rectum', 'large intestine', 'taenia')) return same('digestive', 'large-intestine');
  if (has(n, 'liver')) return same('digestive', 'liver');
  if (has(n, 'gallbladder', 'bile duct')) return same('digestive', 'gallbladder');
  if (has(n, 'pancrea')) return same('digestive', 'pancreas');
  if (has(n, 'parotid', 'sublingual', 'submandibular', 'salivary')) return same('digestive', 'salivary-glands');
  if (has(n, 'omentum', 'mesocolon', 'meso-appendix')) return same('digestive', 'peritoneum');
  if (has(n, 'tongue')) return same('nervous', 'tongue');
  if (has(n, 'gingiva', 'palate', 'uvula', 'mouth')) return same('digestive', 'mouth');

  // Keep a still-useful fallback rather than dropping a source structure.
  return same('digestive', 'mouth');
}

function mapLymphatic(name) {
  const n = clean(name);
  if (has(n, 'thymus')) return same('endocrine', 'thymus');
  if (has(n, 'spleen')) return same('lymphatic', 'spleen');
  if (has(n, 'tonsil')) return same('lymphatic', 'tonsils');
  if (has(n, 'bone marrow', 'marrow')) return same('lymphatic', 'bone-marrow');
  if (has(n, 'vessel', 'duct')) return same('lymphatic', 'lymph-vessels');
  return same('lymphatic', 'lymph-nodes');
}

// The independently redistributed skin mesh is normalized differently from
// the Z-Anatomy system exports. This matrix restores its actual 1.70 m frame:
// y [-1.1, +1.1] → [0, 1.70], width 0.80 → 0.618 m.
const SKIN_TO_CLINICAL_FRAME = new THREE.Matrix4()
  .makeScale(1.7 / 2.2, 1.7 / 2.2, 1.7 / 2.2)
  .premultiply(new THREE.Matrix4().makeTranslation(0, 0.85, 0));

const ASSETS = {
  surface: {
    id: 'surface', file: 'skin.glb', label: 'Body surface', map: mapSurface,
    preTransform: SKIN_TO_CLINICAL_FRAME, roughness: 0.72, source: 'BodyParts3D surface mesh',
  },
  skeletal: {
    id: 'skeletal', file: 'skeletal.glb', label: 'Skeletal system', map: mapSkeleton,
    roughness: 0.57, source: 'Z-Anatomy skeletal system',
  },
  joints: {
    id: 'joints', file: 'joints.glb', label: 'Joints and ligaments', map: mapJoints,
    roughness: 0.61, source: 'Z-Anatomy joints and ligaments',
  },
  muscular: {
    id: 'muscular', file: 'muscular.glb', label: 'Muscular system', map: mapMuscle,
    roughness: 0.68, source: 'Z-Anatomy muscular system',
  },
  nervous: {
    id: 'nervous', file: 'nervous.glb', label: 'Nervous system', map: mapNervous,
    roughness: 0.58, source: 'Z-Anatomy nervous system',
  },
  cardiovascular: {
    id: 'cardiovascular', file: 'cardiovascular.glb', label: 'Cardiovascular system', map: mapCardiovascular,
    roughness: 0.48, source: 'Z-Anatomy circulatory system',
  },
  organs: {
    id: 'organs', file: 'organs.glb', label: 'Internal organs', map: mapOrgans,
    roughness: 0.62, source: 'Z-Anatomy internal organs',
  },
  lymphatic: {
    id: 'lymphatic', file: 'lymphatic.glb', label: 'Lymphatic system', map: mapLymphatic,
    roughness: 0.59, source: 'Z-Anatomy lymphatic system',
  },
};

function toneFor(id) {
  return SKIN_TONES.find((tone) => tone.id === id) || SKIN_TONES.find((tone) => tone.id === 'light') || SKIN_TONES[0];
}

function colourFor(partId, system) {
  // MeshStandardMaterial multiplies its colour by vertex colour. Keep the
  // source skin white at vertex level so the selected complexion is faithful,
  // instead of tinting every complexion twice.
  if (system === 'surface' || partId === 'skin') return new THREE.Color('#ffffff');
  return new THREE.Color(PART_COLOURS[partId] || DEFAULT_COLOURS[system] || '#c9a889');
}

/** Copy a source geometry into the common clinical coordinate frame. */
function sourceGeometryInFrame(source, matrix) {
  const geo = source.clone();
  // Source exports currently carry position + normal. Dropping optional source
  // attributes deliberately keeps every geometry's layout compatible to merge.
  for (const name of Object.keys(geo.attributes)) {
    if (name !== 'position' && name !== 'normal') geo.deleteAttribute(name);
  }
  if (!geo.getAttribute('normal')) geo.computeVertexNormals();
  geo.applyMatrix4(matrix);
  return geo;
}

/** Add renderer colour and exact semantic picking data to a prepared geometry. */
function tagClinicalGeometry(geo, colour, partIndex) {
  const count = geo.getAttribute('position').count;
  const colors = new Float32Array(count * 3);
  const partIndices = new Uint16Array(count);
  for (let i = 0; i < count; i++) {
    colors[i * 3] = colour.r;
    colors[i * 3 + 1] = colour.g;
    colors[i * 3 + 2] = colour.b;
    partIndices[i] = partIndex;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.setAttribute('clinicalPart', new THREE.BufferAttribute(partIndices, 1));
  return geo;
}

/** Prepare a regular named source node so BufferGeometryUtils can merge it. */
function preparedGeometry(source, matrix, colour, partIndex) {
  return tagClinicalGeometry(sourceGeometryInFrame(source, matrix), colour, partIndex);
}

/**
 * The BodyParts3D body surface is one high-quality mesh rather than separately
 * named head/arm/leg objects. Split only its real source triangles into the
 * broad surface regions already taught by this atlas. This preserves a genuine
 * skin surface while keeping head, knee and hand clicks meaningful.
 */
function surfacePartAt(x, y, z) {
  // The incoming position is in the source’s 1.70 m frame. Convert to the
  // scene measurements used by the teaching atlas before doing broad regions.
  const sx = Math.abs(x * CLINICAL_SCALE);
  const sy = y * CLINICAL_SCALE + CLINICAL_Y;
  const sz = z * CLINICAL_SCALE;

  if (sy > 0.69) return sz > 0.035 && sy < 0.84 ? 'face' : 'head';
  if (sy > 0.61) return 'neck';
  if (sx > 0.17) {
    if (sy > 0.31) return 'arm';
    if (sy > 0.23) return 'elbow';
    if (sy > 0.035) return 'forearm';
    return 'hand';
  }
  if (sy > 0.49) return 'shoulder';
  if (sy > 0.27) return sz < -0.025 ? 'back' : 'chest';
  if (sy > 0.015) return sz < -0.03 ? 'back' : 'abdomen';
  if (sy > -0.19) return 'hip';
  if (sy > -0.44) return 'thigh';
  if (sy > -0.53) return 'knee';
  if (sy > -0.83) return 'leg';
  return 'foot';
}

/** Build indexed per-region copies of an otherwise single source skin mesh. */
function splitSurfaceGeometry(source, matrix) {
  const raw = sourceGeometryInFrame(source, matrix);
  const position = raw.getAttribute('position');
  const normal = raw.getAttribute('normal');
  const index = raw.index;
  const total = index ? index.count : position.count;
  const buckets = new Map();

  for (let i = 0; i + 2 < total; i += 3) {
    const a = index ? index.getX(i) : i;
    const b = index ? index.getX(i + 1) : i + 1;
    const c = index ? index.getX(i + 2) : i + 2;
    const partId = surfacePartAt(
      (position.getX(a) + position.getX(b) + position.getX(c)) / 3,
      (position.getY(a) + position.getY(b) + position.getY(c)) / 3,
      (position.getZ(a) + position.getZ(b) + position.getZ(c)) / 3,
    );
    if (!buckets.has(partId)) buckets.set(partId, []);
    buckets.get(partId).push(a, b, c);
  }

  const output = [];
  for (const [partId, triangleIndices] of buckets) {
    const remap = new Map();
    const positions = [];
    const normals = [];
    const indices = [];
    for (const oldIndex of triangleIndices) {
      let next = remap.get(oldIndex);
      if (next === undefined) {
        next = remap.size;
        remap.set(oldIndex, next);
        positions.push(position.getX(oldIndex), position.getY(oldIndex), position.getZ(oldIndex));
        if (normal) normals.push(normal.getX(oldIndex), normal.getY(oldIndex), normal.getZ(oldIndex));
      }
      indices.push(next);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    if (normals.length) geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    else geo.computeVertexNormals();
    geo.setIndex(indices);
    output.push({ partId, geometry: geo });
  }
  raw.dispose();
  return output;
}

/**
 * Extract one semantic part from a combined source mesh only when it is
 * selected. This keeps normal rendering to roughly one draw call per clinical
 * layer, while selection/focus still tracks actual source-derived geometry.
 */
function geometryForPart(combined, wantedPartIndex) {
  const positions = combined.getAttribute('position');
  const normals = combined.getAttribute('normal');
  const parts = combined.getAttribute('clinicalPart');
  if (!positions || !parts) return null;
  const index = combined.index;
  const count = index ? index.count : positions.count;
  const remap = new Map();
  const pos = [];
  const norm = [];
  const indices = [];

  const addVertex = (sourceIndex) => {
    let next = remap.get(sourceIndex);
    if (next !== undefined) return next;
    next = remap.size;
    remap.set(sourceIndex, next);
    pos.push(positions.getX(sourceIndex), positions.getY(sourceIndex), positions.getZ(sourceIndex));
    if (normals) norm.push(normals.getX(sourceIndex), normals.getY(sourceIndex), normals.getZ(sourceIndex));
    return next;
  };

  for (let i = 0; i + 2 < count; i += 3) {
    const a = index ? index.getX(i) : i;
    const b = index ? index.getX(i + 1) : i + 1;
    const c = index ? index.getX(i + 2) : i + 2;
    // Each imported source object gets a single index, so a triangle should be
    // uniform. Testing all vertices makes this safe if a future export is not.
    if (parts.getX(a) !== wantedPartIndex || parts.getX(b) !== wantedPartIndex || parts.getX(c) !== wantedPartIndex) continue;
    indices.push(addVertex(a), addVertex(b), addVertex(c));
  }
  if (!indices.length) return null;
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  if (norm.length) geo.setAttribute('normal', new THREE.Float32BufferAttribute(norm, 3));
  else geo.computeVertexNormals();
  geo.setIndex(indices);
  geo.computeBoundingSphere();
  return geo;
}

/**
 * Manages the asynchronous, source-derived clinical layers for one humanoid.
 * It owns no DOM; Viewer supplies a status callback for the small UI badge.
 */
export class ClinicalAnatomy {
  constructor(human, { onStatus = () => {} } = {}) {
    this.human = human;
    this.onStatus = onStatus;
    this.loader = new GLTFLoader();
    this.states = new Map(Object.keys(ASSETS).map((id) => [id, 'idle']));
    this.queue = [];
    this.loading = false;

    const root = new THREE.Group();
    root.name = 'clinical-reference-meshes';
    root.userData.isClinicalRoot = true;
    human.root.add(root);
    human.referenceRoot = root;
    human.referenceGroups = {};
    human.referenceAssets = new Map();
    human.referencePartSources = new Map();
    human.referenceActiveSystems = new Map();
    human.referenceHighlight = null;

    human.isReferenceActiveForSystem = (system) => {
      const entries = human.referenceActiveSystems.get(system) || [];
      return entries.some((entry) => !entry.sex || entry.sex === human.variant);
    };
    human.referencePart = (partId) => this.referencePart(partId);
    human.clearReferenceHighlight = () => this.clearHighlight();
    human.setReferenceHighlight = (partId) => this.highlightPart(partId);
    human.setReferenceSkin = (toneId) => this.setSkin(toneId);
  }

  ensureSystems(systemIds = []) {
    const wanted = new Set();
    for (const systemId of systemIds) {
      for (const assetId of SYSTEM_ASSETS[systemId] || []) wanted.add(assetId);
    }
    for (const assetId of wanted) this.enqueue(assetId);
  }

  enqueue(assetId) {
    const state = this.states.get(assetId);
    if (!ASSETS[assetId] || state === 'queued' || state === 'loading' || state === 'ready') return;
    this.states.set(assetId, 'queued');
    this.queue.push(assetId);
    this.onStatus({ state: 'queued', asset: ASSETS[assetId], queued: this.queue.length });
    this.next();
  }

  async next() {
    if (this.loading || !this.queue.length) return;
    const assetId = this.queue.shift();
    const asset = ASSETS[assetId];
    if (!asset) return this.next();
    this.loading = true;
    this.states.set(assetId, 'loading');
    this.onStatus({ state: 'loading', asset, queued: this.queue.length });
    try {
      // A document-relative URL works both at Vite's root and inside the
      // GitHub Pages project subpath (`base: './'`).
      const gltf = await this.loader.loadAsync(`./models/clinical/${asset.file}`);
      const summary = this.integrate(asset, gltf.scene);
      this.states.set(assetId, 'ready');
      this.onStatus({ state: 'ready', asset, queued: this.queue.length, ...summary });
    } catch (error) {
      // Keep the hand-authored educational mesh visible as an offline/network
      // fallback rather than leaving a system empty.
      console.warn(`Could not load clinical anatomy asset ${asset.file}:`, error);
      this.states.set(assetId, 'failed');
      this.onStatus({ state: 'failed', asset, error, queued: this.queue.length });
    } finally {
      this.loading = false;
      this.next();
    }
  }

  integrate(asset, scene) {
    scene.updateMatrixWorld(true);
    const grouped = new Map();
    let sourceNodes = 0;

    scene.traverse((object) => {
      if (!object.isMesh || !object.geometry?.getAttribute('position')) return;
      const transform = new THREE.Matrix4().copy(object.matrixWorld);
      if (asset.preTransform) transform.premultiply(asset.preTransform);

      // All anatomical GLBs except the skin carry useful source node names.
      // The skin is one mesh, so turn its real triangles into broad atlas
      // regions before merging rather than giving every click the label “Skin”.
      const mappedGeometries = asset.id === 'surface'
        ? splitSurfaceGeometry(object.geometry, transform).map(({ partId, geometry }) => ({
          mapped: same('surface', partId), geometry,
        }))
        : [{ mapped: asset.map(object.name || ''), geometry: null }];

      for (const { mapped, geometry: splitGeometry } of mappedGeometries) {
        if (!mapped?.system || !mapped.partId) {
          splitGeometry?.dispose();
          continue;
        }
        const groupKey = `${mapped.system}|${mapped.sex || ''}`;
        let entry = grouped.get(groupKey);
        if (!entry) {
          entry = {
            system: mapped.system,
            sex: mapped.sex || null,
            geometries: [],
            partIds: [],
            partIndex: new Map(),
          };
          grouped.set(groupKey, entry);
        }
        let index = entry.partIndex.get(mapped.partId);
        if (index === undefined) {
          index = entry.partIds.length;
          entry.partIndex.set(mapped.partId, index);
          entry.partIds.push(mapped.partId);
        }
        const colour = colourFor(mapped.partId, mapped.system);
        entry.geometries.push(splitGeometry
          ? tagClinicalGeometry(splitGeometry, colour, index)
          : preparedGeometry(object.geometry, transform, colour, index));
      }
      sourceNodes++;
    });

    let meshes = 0;
    let parts = 0;
    for (const entry of grouped.values()) {
      if (!entry.geometries.length) continue;
      const geometry = mergeGeometries(entry.geometries, false);
      for (const geo of entry.geometries) geo.dispose();
      if (!geometry) {
        console.warn(`Could not combine clinical ${asset.id}/${entry.system} geometries.`);
        continue;
      }
      geometry.computeBoundingSphere();
      const tone = toneFor(this.human.skin);
      const material = new THREE.MeshStandardMaterial({
        name: `clinical-${asset.id}-${entry.system}`,
        color: entry.system === 'surface' ? tone.base : '#ffffff',
        vertexColors: true,
        roughness: asset.roughness ?? 0.6,
        metalness: 0,
        side: THREE.FrontSide,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = `clinical-${asset.id}-${entry.system}${entry.sex ? `-${entry.sex}` : ''}`;
      mesh.position.set(0, CLINICAL_Y, 0);
      mesh.scale.setScalar(CLINICAL_SCALE);
      mesh.castShadow = false; // a two-million-triangle shadow map is not useful at atlas distance
      mesh.receiveShadow = false;
      mesh.frustumCulled = true;
      mesh.userData = {
        partId: entry.partIds[0],
        system: entry.system,
        partName: asset.label,
        // A source composite contains neighbouring fine structures in one draw
        // call. Keep the authentic layer visible whenever its system is on;
        // the atlas list/text still gates advanced named entries by level.
        minLevel: 1,
        pickable: true,
        baseMaterial: material,
        currentMaterial: material,
        basePosition: mesh.position.clone(),
        baseScale: mesh.scale.clone(),
        referenceComposite: true,
        referenceAsset: asset.id,
        referenceSex: entry.sex,
        referencePartIds: entry.partIds,
      };

      let systemGroup = this.human.referenceGroups[entry.system];
      if (!systemGroup) {
        systemGroup = new THREE.Group();
        systemGroup.name = `clinical-${entry.system}`;
        this.human.referenceRoot.add(systemGroup);
        this.human.referenceGroups[entry.system] = systemGroup;
      }
      systemGroup.add(mesh);
      meshes++;
      parts += entry.partIds.length;

      for (let index = 0; index < entry.partIds.length; index++) {
        const partId = entry.partIds[index];
        if (!this.human.referencePartSources.has(partId)) this.human.referencePartSources.set(partId, []);
        this.human.referencePartSources.get(partId).push({ mesh, partIndex: index, system: entry.system, sex: entry.sex });
      }
      if (!this.human.referenceActiveSystems.has(entry.system)) this.human.referenceActiveSystems.set(entry.system, []);
      this.human.referenceActiveSystems.get(entry.system).push({ assetId: asset.id, sex: entry.sex });
    }
    this.human.referenceAssets.set(asset.id, asset);
    // Make freshly loaded composite meshes available to Viewer raycasting
    // without rebuilding/discarding the lightweight fallback model.
    this.human.reindex?.();
    return { meshes, parts, sourceNodes };
  }

  /** Resolve a coarse atlas part to one or more source-mesh subranges. */
  referencePart(partId) {
    let sources = this.human.referencePartSources.get(partId) || [];
    // The external skin mesh is partitioned into useful surface regions. The
    // Integumentary entry “Skin” sensibly means all of those genuine triangles.
    if (partId === 'skin' && !sources.length) {
      sources = [...this.human.referencePartSources.entries()]
        .filter(([, entries]) => entries.some((entry) => entry.system === 'surface'))
        .flatMap(([, entries]) => entries.filter((entry) => entry.system === 'surface'));
    }
    const active = sources.filter((source) => !source.sex || source.sex === this.human.variant);
    return active.length ? active : null;
  }

  /** Build a very short-lived, exact source-geometry selection overlay. */
  highlightPart(partId) {
    this.clearHighlight();
    if (!partId) return null;
    const sources = this.referencePart(partId);
    if (!sources) return null;

    const group = new THREE.Group();
    group.name = `clinical-selection-${partId}`;
    group.userData.referenceHighlight = true;
    group.userData.systems = [...new Set(sources.map((source) => source.system))];
    const material = new THREE.MeshStandardMaterial({
      color: '#39ddff', emissive: '#20cde8', emissiveIntensity: 0.8,
      transparent: true, opacity: 0.62, depthWrite: false,
      roughness: 0.35, metalness: 0.05, side: THREE.DoubleSide,
      polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1,
    });

    for (const source of sources) {
      const geometry = geometryForPart(source.mesh.geometry, source.partIndex);
      if (!geometry) continue;
      const overlay = new THREE.Mesh(geometry, material);
      overlay.position.copy(source.mesh.position);
      overlay.quaternion.copy(source.mesh.quaternion);
      overlay.scale.copy(source.mesh.scale);
      overlay.renderOrder = 5;
      overlay.userData = { referenceHighlight: true, partId, system: source.system };
      group.add(overlay);
    }
    if (!group.children.length) {
      material.dispose();
      return null;
    }
    this.human.referenceRoot.add(group);
    this.human.referenceHighlight = group;
    return group;
  }

  clearHighlight() {
    const group = this.human.referenceHighlight;
    if (!group) return;
    group.traverse((object) => {
      if (object.isMesh) object.geometry?.dispose();
    });
    const materials = new Set();
    group.traverse((object) => { if (object.isMesh && object.material) materials.add(object.material); });
    for (const material of materials) material.dispose?.();
    group.removeFromParent();
    this.human.referenceHighlight = null;
  }

  setSkin(toneId) {
    const tone = toneFor(toneId);
    this.human.referenceRoot.traverse((object) => {
      if (!object.isMesh || object.userData.referenceAsset !== 'surface') return;
      object.userData.baseMaterial?.color.set(tone.base);
      object.userData.currentMaterial?.color?.set(tone.base);
    });
  }
}

/** Resolve the coarse atlas id from a raycast hit on a combined clinical mesh. */
export function clinicalPartIdFromHit(hit) {
  const mesh = hit?.object;
  if (!mesh?.userData?.referenceComposite) return mesh?.userData?.partId || null;
  const attribute = mesh.geometry?.getAttribute('clinicalPart');
  const vertex = hit.face?.a;
  const index = attribute && Number.isFinite(vertex) ? attribute.getX(vertex) : 0;
  return mesh.userData.referencePartIds?.[index] || mesh.userData.partId || null;
}

export const CLINICAL_DATASET_LABEL = 'BodyParts3D / Z-Anatomy clinical reference mesh';
export const CLINICAL_ASSETS = ASSETS;

export default ClinicalAnatomy;

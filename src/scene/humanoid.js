import * as THREE from 'three';
import { buildSurface, buildIntegumentary } from './builders/surface.js';
import { DEFAULT_TONE } from './anatomy.js';
import { buildSkeletal } from './builders/skeletal.js';
import { buildMuscular } from './builders/muscular.js';
import { buildNervous } from './builders/nervous.js';
import { buildCardiovascular } from './builders/cardiovascular.js';
import { buildRespiratory, buildDigestive, buildUrinary, buildEndocrine, buildLymphatic, buildReproductive } from './builders/organs.js';
import { buildMicro } from './builders/micro.js';
import { PART_BY_ID } from '../data/index.js';

export const SYSTEM_ORDER = [
  'integumentary',
  'surface',
  'skeletal',
  'muscular',
  'nervous',
  'cardiovascular',
  'respiratory',
  'digestive',
  'urinary',
  'endocrine',
  'lymphatic',
  'reproductive',
  'micro',
];

/** Histology / micro models that live inside a system group. */
const HISTOLOGY = [
  ['skeletal', 'histology-bone', 'bone-tissue'],
  ['muscular', 'muscle-bundle', 'muscle-overview'],
  ['nervous', 'neuron-model', 'neuron'],
  ['cardiovascular', 'blood-model', 'red-blood-cell'],
  ['respiratory', 'alveoli-model', 'alveoli'],
  ['digestive', 'villi-model', 'small-intestine'],
  ['urinary', 'nephron-model', 'nephron'],
  ['lymphatic', 'immune-model', 'immunity-innate'],
  ['integumentary', 'skin-block', 'epidermis'],
];

const MICRO_ALIASES = {
  blood: 'red-blood-cell',
  'white-blood-cell': 'red-blood-cell',
  platelets: 'red-blood-cell',
  'immunity-adaptive': 'immunity-innate',
  dermis: 'epidermis',
  nucleus: 'cell',
  mitochondria: 'cell',
  'er-golgi': 'cell',
  membrane: 'cell',
  'growth-hormone': 'hormones',
  'stress-response': 'hormones',
  'spleen-vascular': 'capillaries',
  'respiratory-control': 'homeostasis',
  'kidney-function': 'nephron',
  'pregnancy-development': 'stem-cells',
  gametes: 'cell',
  puberty: 'hormones',
  pregnancy: 'stem-cells',
  'wound-healing': 'epithelium',
  'touch-receptors': 'nervous-tissue',
  'smooth-muscle': 'muscle-tissue-types',
  homeostasis: 'homeostasis',
  aging: 'aging',
  hormones: 'hormones',
  'stem-cells': 'stem-cells',
  molecular: 'molecular',
  capillaries: 'capillaries',
  epithelium: 'epithelium',
  'connective-tissue': 'connective-tissue',
  'muscle-tissue-types': 'muscle-tissue-types',
  'nervous-tissue': 'nervous-tissue',
  cell: 'cell',
  'red-blood-cell': 'red-blood-cell',
};

function reindex(human) {
  const { root, systems, SYSTEM_ORDER } = human;
  const byPart = new Map();
  const allMeshes = [];
  for (const key of SYSTEM_ORDER) {
    const grp = systems[key];
    if (!grp) continue;
    grp.traverse((o) => {
      if (!o.isMesh) return;
      // skip the histology sub-models: they are revealed only in the micro view
      const inHistology = HISTOLOGY.some(([, name]) => nameOfRoot(o, grp) === name);
      if (inHistology) return;
      if (!o.userData.partId) return;
      o.userData.system = key;
      allMeshes.push(o);
      if (!byPart.has(o.userData.partId)) byPart.set(o.userData.partId, []);
      byPart.get(o.userData.partId).push(o);
    });
  }
  human.byPart = byPart;
  human.allMeshes = allMeshes;
}

/**
 * The figure. `variant` drives the body-type tables (shoulder/hip ratio,
 * muscle bulk, bust, jaw, hair length) as well as the reproductive anatomy,
 * and `skin` picks the complexion used by the skin material.
 */
export function buildHumanoid(reproductiveVariant = 'female', { skin = DEFAULT_TONE } = {}) {
  const root = new THREE.Group();
  root.name = 'human-body';

  const systems = {
    integumentary: buildIntegumentary({ variant: reproductiveVariant, skin }),
    surface: buildSurface({ variant: reproductiveVariant, skin }),
    skeletal: buildSkeletal(),
    muscular: buildMuscular(),
    nervous: buildNervous(),
    cardiovascular: buildCardiovascular(),
    respiratory: buildRespiratory(),
    digestive: buildDigestive(),
    urinary: buildUrinary(),
    endocrine: buildEndocrine(),
    lymphatic: buildLymphatic(),
    reproductive: buildReproductive(reproductiveVariant),
  };

  for (const key of SYSTEM_ORDER) {
    if (systems[key]) root.add(systems[key]);
  }

  const human = { root, systems, microRoot: null, byPart: new Map(), allMeshes: [], SYSTEM_ORDER };

  // The micro world is kept out of the body root so that whole-body framing
  // (bounding boxes, camera focus) never includes the magnified cell models.
  const microRoot = buildMicro();
  microRoot.visible = false;
  systems.micro = microRoot;
  human.microRoot = microRoot;

  /* ---------- micro / histology model registry ---------- */
  const microModels = new Map(); // partId -> { group, parent, name }
  for (const [sysKey, name, partId] of HISTOLOGY) {
    const grp = systems[sysKey].getObjectByName(name);
    if (grp) microModels.set(partId, { group: grp, parent: grp.parent, label: groupLabel(partId) });
  }
  microRoot.children.forEach((child) => {
    const id = child.name.replace(/^micro-/, '');
    microModels.set(id, { group: child, parent: microRoot, label: groupLabel(id) });
  });

  reindex(human);

  const resolveMicroModel = (partId) => {
    const direct = microModels.get(partId);
    if (direct) return direct;
    const alias = MICRO_ALIASES[partId];
    return alias ? microModels.get(alias) : null;
  };

  Object.assign(human, { microModels, resolveMicroModel });

  /** Replace one layer in place and re-index the picking maps. */
  const relayer = (key, build) => {
    const prev = systems[key];
    const next = build();
    if (prev.parent) next.position.copy(prev.position);
    root.add(next);
    root.remove(prev);
    prev.traverse((o) => {
      if (o.isMesh && o.geometry) o.geometry.dispose();
    });
    systems[key] = next;
  };

  /**
   * Female ↔ male: the reproductive organs change, and so does the whole
   * figure, because the two body types differ in shoulder, waist, hip, jaw
   * and hair as well as in gonads.
   */
  human.setVariant = (variant) => {
    human.variant = variant;
    relayer('reproductive', () => buildReproductive(variant));
    relayer('surface', () => buildSurface({ variant, skin: human.skin }));
    relayer('integumentary', () => buildIntegumentary({ variant, skin: human.skin }));
    reindex(human);
    return human;
  };

  /** Complexion: rebuilds the skin and the hair tone that goes with it. */
  human.setSkin = (skin) => {
    human.skin = skin;
    relayer('surface', () => buildSurface({ variant: human.variant, skin }));
    relayer('integumentary', () => buildIntegumentary({ variant: human.variant, skin }));
    reindex(human);
    return human;
  };
  human.variant = reproductiveVariant;
  human.skin = skin;

  return human;
}

function nameOfRoot(obj, stopAt) {
  let o = obj;
  while (o.parent && o.parent !== stopAt) o = o.parent;
  return o.name;
}

function groupLabel(partId) {
  const p = PART_BY_ID[partId];
  return p ? p.name : partId;
}

export default buildHumanoid;

import * as THREE from 'three';
import { LM, add, limbGeometry, ellipsoidGeometry, blobGeometry, tubeGeometry, v3, roundedBoxGeometry, material } from '../helpers.js';

const SKIN = '#e8b98f';
const SKIN_DARK = '#d9a374';

/**
 * The visible body figure. Each region is its own mesh so that a
 * Class-1 learner can click "arm" or "knee" and get an answer.
 */
export function buildSurface() {
  const g = new THREE.Group();
  g.name = 'surface';

  // head + face
  add(g, ellipsoidGeometry(0.1, 0.122, 0.104, 30), 'head', 'surface', SKIN, { position: v3(0, 0.79, -0.004) });
  const face = add(g, ellipsoidGeometry(0.078, 0.082, 0.062, 24), 'face', 'surface', SKIN, {
    position: v3(0, 0.766, 0.072),
  });
  face.geometry.scale(1, 1, 0.72);
  // visible facial features (eyes, nose, mouth) so the youngest learners can point at them
  for (const s2 of [1, -1]) {
    add(g, ellipsoidGeometry(0.016, 0.013, 0.012, 14), 'face', 'surface', '#fbfbf7', { position: v3(s2 * 0.032, 0.792, 0.098) });
    add(g, ellipsoidGeometry(0.0072, 0.0072, 0.006, 12), 'face', 'surface', '#4a6f9c', { position: v3(s2 * 0.032, 0.792, 0.109) });
    add(g, ellipsoidGeometry(0.0032, 0.0032, 0.003, 10), 'face', 'surface', '#141414', { position: v3(s2 * 0.032, 0.792, 0.1135) });
    add(g, ellipsoidGeometry(0.018, 0.004, 0.006, 10), 'face', 'surface', SKIN_DARK, { position: v3(s2 * 0.032, 0.815, 0.096) });
  }
  add(g, ellipsoidGeometry(0.013, 0.022, 0.016, 14), 'face', 'surface', SKIN, { position: v3(0, 0.766, 0.108) });
  add(g, ellipsoidGeometry(0.026, 0.008, 0.008, 12), 'face', 'surface', '#b4616a', { position: v3(0, 0.734, 0.096) });
  // ears
  for (const s of [1, -1]) {
    add(g, ellipsoidGeometry(0.012, 0.026, 0.018, 14), 'head', 'surface', SKIN_DARK, {
      position: v3(s * 0.098, 0.782, -0.008), scale: [0.7, 1, 1],
    });
  }
  // neck
  add(g, limbGeometry(v3(0, 0.742, 0.002), v3(0, 0.62, 0.006), 0.048, 0.058, 1.0, 20), 'neck', 'surface', SKIN);

  // trunk: chest, abdomen, back, pelvis
  const chest = add(g, ellipsoidGeometry(0.155, 0.15, 0.105, 30), 'chest', 'surface', SKIN, { position: v3(0, 0.4, 0.008) });
  chest.geometry.scale(1, 1, 1);
  const abd = add(g, ellipsoidGeometry(0.128, 0.15, 0.095, 30), 'abdomen', 'surface', SKIN, { position: v3(0, 0.13, 0.012) });
  abd.geometry.scale(1, 1, 1);
  const back = add(g, ellipsoidGeometry(0.148, 0.24, 0.075, 30), 'back', 'surface', SKIN, { position: v3(0, 0.285, -0.05) });
  back.geometry.scale(1, 1, 1);
  add(g, ellipsoidGeometry(0.142, 0.105, 0.098, 26), 'hip', 'surface', SKIN, { position: v3(0, 0.0, 0.004) });

  // mammary region (appears from Class 9 onwards, like the rest of the reproductive system)
  for (const s of [1, -1]) {
    const breast = add(g, ellipsoidGeometry(0.055, 0.05, 0.04, 20), 'mammary', 'surface', SKIN, {
      position: v3(s * 0.062, 0.42, 0.088),
    });
    breast.geometry.scale(1, 1, 0.8);
  }

  // nipples / umbilicus as small landmarks (helps orientation)
  for (const s of [1, -1]) {
    add(g, blobGeometry(0.008, 1, 0, 4, 0), 'chest', 'surface', SKIN_DARK, { position: v3(s * 0.06, 0.4, 0.108), scale: [1, 1, 0.4] });
  }
  add(g, blobGeometry(0.009, 1, 0, 4, 0), 'abdomen', 'surface', SKIN_DARK, { position: v3(0, 0.1, 0.104), scale: [1, 1, 0.4] });

  // limbs
  for (const s of [1, -1]) {
    add(g, ellipsoidGeometry(0.072, 0.062, 0.068, 20), 'shoulder', 'surface', SKIN, { position: v3(s * 0.168, 0.525, 0) });
    add(g, limbGeometry(v3(s * 0.185, 0.53, 0.002), v3(s * 0.222, 0.298, 0.006), 0.052, 0.042, 1.08, 18), 'arm', 'surface', SKIN);
    add(g, ellipsoidGeometry(0.042, 0.04, 0.042, 16), 'elbow', 'surface', SKIN, { position: v3(s * 0.223, 0.292, 0.005) });
    add(g, limbGeometry(v3(s * 0.223, 0.29, 0.006), v3(s * 0.234, 0.05, 0.012), 0.042, 0.03, 1.05, 16), 'forearm', 'surface', SKIN);
    const hand = add(g, ellipsoidGeometry(0.03, 0.062, 0.018, 18), 'hand', 'surface', SKIN, { position: v3(s * 0.238, 0.0, 0.012) });
    hand.geometry.scale(1, 1, 1);
    // thumb
    add(g, limbGeometry(v3(s * 0.222, 0.012, 0.03), v3(s * 0.215, -0.014, 0.042), 0.012, 0.009, 1, 10), 'hand', 'surface', SKIN);

    add(g, limbGeometry(v3(s * 0.085, -0.03, 0.002), v3(s * 0.092, -0.44, 0.006), 0.083, 0.058, 1.05, 20), 'thigh', 'surface', SKIN);
    add(g, ellipsoidGeometry(0.055, 0.05, 0.055, 16), 'knee', 'surface', SKIN, { position: v3(s * 0.092, -0.448, 0.008) });
    add(g, limbGeometry(v3(s * 0.092, -0.45, 0.006), v3(s * 0.088, -0.828, -0.004), 0.058, 0.036, 1.12, 18), 'leg', 'surface', SKIN);
    const foot = add(g, ellipsoidGeometry(0.042, 0.032, 0.13, 18), 'foot', 'surface', SKIN, { position: v3(s * 0.088, -0.866, 0.06) });
    foot.geometry.scale(1, 1.05, 1);
    add(g, ellipsoidGeometry(0.036, 0.02, 0.022, 12), 'foot', 'surface', SKIN_DARK, { position: v3(s * 0.088, -0.888, 0.163) });
  }

  return g;
}

/** Integumentary system: the skin as an organ, hair, nails, glands. */
export function buildIntegumentary() {
  const g = new THREE.Group();
  g.name = 'integumentary';

  // translucent skin envelope: a body-shaped shell that wraps the whole figure
  const shellMat = material('#e0a882', { opacity: 0.16, transparent: true, depthWrite: false, side: THREE.DoubleSide, roughness: 0.4 });
  const shell = new THREE.Group();
  shell.name = 'skin-envelope';
  const shellPart = (geo, opts) => add(shell, geo, 'skin', 'integumentary', shellMat, opts);
  const trunk = shellPart(ellipsoidGeometry(0.168, 0.42, 0.118, 28), { position: v3(0, 0.29, 0.012) });
  shellPart(ellipsoidGeometry(0.118, 0.14, 0.122, 24), { position: v3(0, 0.79, -0.004) });
  shellPart(limbGeometry(v3(0, 0.735, 0.004), v3(0, 0.615, 0.008), 0.055, 0.062, 1.0, 18), {});
  for (const s of [1, -1]) {
    shellPart(ellipsoidGeometry(0.082, 0.07, 0.078, 18), { position: v3(s * 0.168, 0.525, 0) });
    shellPart(limbGeometry(v3(s * 0.185, 0.53, 0.002), v3(s * 0.222, 0.298, 0.006), 0.058, 0.046, 1.08, 16), {});
    shellPart(limbGeometry(v3(s * 0.223, 0.29, 0.006), v3(s * 0.234, 0.05, 0.012), 0.046, 0.032, 1.05, 14), {});
    shellPart(ellipsoidGeometry(0.036, 0.07, 0.024, 14), { position: v3(s * 0.238, 0.0, 0.012) });
    shellPart(limbGeometry(v3(s * 0.085, -0.03, 0.002), v3(s * 0.092, -0.44, 0.006), 0.092, 0.064, 1.05, 18), {});
    shellPart(limbGeometry(v3(s * 0.092, -0.45, 0.006), v3(s * 0.088, -0.828, -0.004), 0.064, 0.04, 1.12, 16), {});
    shellPart(ellipsoidGeometry(0.048, 0.038, 0.14, 16), { position: v3(s * 0.088, -0.866, 0.06) });
  }
  shell.visible = false;
  g.add(shell);

  // hair cap
  const hair = add(g, blobGeometry(0.108, 3, 0.02, 7, 3), 'hair', 'integumentary', '#5a3b2b', {
    position: v3(0, 0.795, -0.012), scale: [1, 1.02, 1.02],
  });
  // trim the hair so it does not cover the face
  hair.geometry.scale(1, 1, 1);
  // nails
  for (const s of [1, -1]) {
    for (let f = 0; f < 4; f++) {
      add(g, roundedBoxGeometry(0.008, 0.012, 0.003, 0.002), 'hair', 'integumentary', '#f2d9c4', {
        position: v3(s * (0.226 + f * 0.0095), -0.062, 0.03),
      });
    }
    add(g, roundedBoxGeometry(0.008, 0.01, 0.003, 0.002), 'hair', 'integumentary', '#f2d9c4', { position: v3(s * 0.088, -0.878, 0.14) });
  }
  // sweat glands: little coils over the trunk
  let seed = 1;
  for (let i = 0; i < 14; i++) {
    const a = i * 2.399;
    const y = 0.45 - (i / 14) * 0.5;
    const p = v3(Math.cos(a) * 0.1, y, Math.cos(a) * 0.05 + 0.02);
    add(g, new THREE.TorusGeometry(0.006, 0.0016, 6, 10, Math.PI * 1.6), 'sweat-glands', 'integumentary', '#8fbfa8', {
      position: p, rotation: [a, a * 0.7, 0],
    });
    seed++;
  }
  // touch receptors: tiny corpuscles at the fingertips
  for (const s of [1, -1]) {
    add(g, blobGeometry(0.006, 1, 0.1, 9, 4), 'touch-receptors', 'integumentary', '#f0a3c0', { position: v3(s * 0.234, -0.03, 0.028) });
  }
  // histology anchor: layered skin block (used in the micro view)
  const block = new THREE.Group();
  block.name = 'skin-block';
  block.visible = false;
  const layers = [
    ['#f6d3a8', 0.006, 0.032],
    ['#e79f5f', 0.018, -0.004],
    ['#f3e2b6', 0.022, -0.032],
  ];
  layers.forEach(([c, h, y], i) => {
    add(block, roundedBoxGeometry(0.11, h * 2, 0.09, 0.004), ['epidermis', 'dermis', 'dermis'][i], 'integumentary', c, { position: v3(0, y, 0) });
  });
  g.add(block);

  return g;
}

export default buildSurface;

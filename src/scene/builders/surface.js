/**
 * surface.js — the visible body.
 *
 * The figure used to be a stack of overlapping ellipsoids, which reads as a
 * balloon model. It is now swept from the measurement tables in anatomy.js:
 * a lofted trunk (gluteal fold → waist → ribcage → shoulder girdle), limbs
 * with real muscle bellies and joint definition, a sculpted head with lids,
 * brows, nose, lips and ears, hands with five fingers and feet with toes.
 *
 * Every region stays its own mesh, so a Class-1 learner can still click
 * "elbow" or "knee" and get an answer.
 */
import * as THREE from 'three';
import {
  add, loftGeometry, limbLoft, ellipsoidGeometry, blobGeometry, tubeGeometry,
  roundedBoxGeometry, arcGeometry, material, mergeGeometries, placed, v3,
} from '../helpers.js';
import {
  SKIN_TONES, DEFAULT_TONE, PROPORTIONS, HEAD_CENTER_Z, FINGER_LENGTHS,
  limbProfile, LIMB_PROFILES, PALM_PROFILE, surfaceColors, trunkSections, headNeckSections,
} from '../anatomy.js';
import { skinMaterial, hairMaterial, nailMaterial, lipMaterial } from '../materials.js';

const TAU = Math.PI * 2;

export function toneById(id) {
  return SKIN_TONES.find((t) => t.id === id) ?? SKIN_TONES[DEFAULT_TONE_INDEX()];
}
function DEFAULT_TONE_INDEX() {
  return Math.max(0, SKIN_TONES.findIndex((t) => t.id === DEFAULT_TONE));
}

/* ------------------------------------------------------------------ *
 * Table utilities
 * ------------------------------------------------------------------ */

/** Interpolate a section table at a height, so neighbouring bands meet exactly. */
function rowAt(rows, y) {
  if (y <= rows[0][0]) return rows[0].slice();
  const last = rows[rows.length - 1];
  if (y >= last[0]) return last.slice();
  for (let i = 0; i < rows.length - 1; i++) {
    const a = rows[i];
    const b = rows[i + 1];
    if (y >= a[0] && y <= b[0]) {
      const k = (y - a[0]) / Math.max(1e-6, b[0] - a[0]);
      return a.map((v, c) => (c === 0 ? y : v + (b[c] - v) * k));
    }
  }
  return last.slice();
}

/** Sample rows between two heights, inclusive, `steps` apart. */
function bandRows(rows, y0, y1, steps) {
  const out = [];
  for (let i = 0; i <= steps; i++) out.push(rowAt(rows, y0 + ((y1 - y0) * i) / steps));
  return out;
}

function inflateRows(rows, by) {
  return rows.map(([y, rx, rz, rzb, exp]) => [y, rx + by, rz + by, rzb + by, exp]);
}

/** Loft a list of table rows into a surface, optionally only part of the ring. */
function loftRows(rows, opts = {}) {
  const { u0 = 0, u1 = 1, seg = 46, zc = 0, capStart = false, capEnd = false } = opts;
  const sections = rows.map(([y, rx, rz, rzb, exp]) => ({ x: 0, y, z: zc, rx, rz, rzb, exp }));
  return loftGeometry(sections, { seg, u0, u1, capStart, capEnd });
}

/** Where the skin of the trunk lies at a given height (used to seat features). */
function frontZ(rows, y, zc) {
  const r = rowAt(rows, y);
  return zc + r[2];
}
function sideX(rows, y) {
  return rowAt(rows, y)[1];
}

/* ------------------------------------------------------------------ *
 * The figure
 * ------------------------------------------------------------------ */
export function buildSurface({ variant = 'female', skin = DEFAULT_TONE } = {}) {
  const g = new THREE.Group();
  g.name = 'surface';

  const p = PROPORTIONS[variant] ?? PROPORTIONS.female;
  const tone = toneById(skin);
  const cols = surfaceColors(tone);
  const skinMat = skinMaterial(tone);
  const skinSoft = skinMaterial(tone, { roughness: 0.55, normalScale: 0.35, retile: [4, 4] });
  const isMale = variant === 'male';

  const trunk = trunkSections(p);
  const { head: headRows, neck: neckRows } = headNeckSections(p);

  /* ---------------- trunk: one continuous surface, split into regions ------
   * Bands share their boundary rings exactly, so the silhouette stays smooth
   * while each region remains independently clickable. The posterior wedge is
   * its own "back" mesh so clicking your own back from behind says "back".   */
  // Angle 0 is the body's own left flank and a quarter turn (u = 0.25) is the
  // front, so the anterior half of the ring is u ∈ [0, 0.5]. Each region band
  // gets a hair of overlap at the flanks and the back is drawn a fraction proud:
  // from the front you always hit chest/abdomen, from behind always back.
  const FRONT_U = [-0.006, 0.506];
  const BACK_U = [0.494, 1.006];
  const bands = [
    { part: 'hip', y0: -0.208, y1: 0.022, steps: 12, full: true, capStart: true },
    { part: 'abdomen', y0: 0.022, y1: 0.288, steps: 10, capStart: false },
    { part: 'chest', y0: 0.288, y1: 0.512, steps: 10 },
    { part: 'shoulder', y0: 0.512, y1: 0.676, steps: 8, capEnd: true },
  ];
  for (const b of bands) {
    const rows = bandRows(trunk, b.y0, b.y1, b.steps);
    const u = b.full ? [0, 1] : FRONT_U;
    add(g, loftRows(rows, { u0: u[0], u1: u[1], seg: 52, capStart: b.capStart, capEnd: b.capEnd }), b.part, 'surface', skinMat, {
      receiveShadow: true,
    });
    if (!b.full) {
      add(g, loftRows(bandRows(trunk, b.y0, b.y1, b.steps), { u0: BACK_U[0] + 0.006, u1: BACK_U[1] - 0.006, seg: 40 }), 'back', 'surface', skinMat, {
        receiveShadow: true,
      });
    }
  }
  // the back runs on up to the shoulders, where the front band hands over
  add(g, loftRows(bandRows(trunk, 0.288, 0.575, 10), { u0: BACK_U[0] + 0.002, u1: BACK_U[1] - 0.002, seg: 40 }), 'back', 'surface', skinMat, {
    receiveShadow: true,
  });

  // navel + superficial landmarks that make the trunk read as a body
  const umb = frontZ(trunk, 0.085, 0) - 0.002;
  add(g, new THREE.TorusGeometry(0.0075, 0.0026, 6, 14), 'abdomen', 'surface', material(cols.areola, { roughness: 0.85 }), {
    position: v3(0, 0.083, umb), rotation: [0.1, 0, 0],
  });
  for (const s of [1, -1]) {
    // iliac crest: the ridge you can feel at the front of the hips
    add(g, tubeGeometry([
      v3(s * sideX(trunk, 0.02, 0) * 0.35, 0.052, frontZ(trunk, 0.05, 0) - 0.006),
      v3(s * sideX(trunk, 0.01) * 0.78, 0.028, frontZ(trunk, 0.02, 0) - 0.004),
      v3(s * sideX(trunk, -0.02) * 0.94, -0.004, frontZ(trunk, -0.01, 0) + 0.004),
    ], 0.0055, 14, 6), 'hip', 'surface', skinMat, { pickable: true });
  }
  for (const s of [1, -1]) {
    // clavicles: visible surface ridges on every body type
    add(g, tubeGeometry([
      v3(0, 0.508, frontZ(trunk, 0.50, 0) - 0.012),
      v3(s * 0.055, 0.514, frontZ(trunk, 0.51, 0) - 0.006),
      v3(s * 0.112, 0.523, frontZ(trunk, 0.52, 0) + 0.004),
      v3(s * sideX(trunk, 0.53) * 0.98, 0.528, 0.004),
    ], 0.0072, 20, 7), 'shoulder', 'surface', skinMat);
  }
  // sternal notch: a small hollow at the top of the breastbone
  add(g, ellipsoidGeometry(0.014, 0.008, 0.008, 14), 'chest', 'surface', material(cols.areola, { roughness: 0.9, opacity: 0.75 }), {
    position: v3(0, 0.503, frontZ(trunk, 0.50, 0) - 0.004),
  });
  // the gluteal crease
  add(g, tubeGeometry([v3(0, 0.022, -frontZ(trunk, 0.02, 0) + 0.004), v3(0, -0.06, -rowAt(trunk, -0.06)[3] + 0.002), v3(0, -0.15, -rowAt(trunk, -0.15)[3] + 0.006)], 0.005, 12, 6),
    'back', 'surface', material(cols.shade, { roughness: 0.9, opacity: 0.55 }));

  /* ---------------- mammary region ---------------- */
  for (const s of [1, -1]) {
    const yC = 0.418;
    const zC = frontZ(trunk, yC, 0) - 0.012;
    const bust = isMale ? 0.026 : 0.052;
    const breast = add(g, blobGeometry(1, 4, isMale ? 0.01 : 0.03, 3, s * 1.7), 'mammary', 'surface', skinMat, {
      position: v3(s * 0.066, yC - (isMale ? 0.0 : 0.006), zC + bust * 0.5),
      scale: [0.052, isMale ? 0.05 : 0.058, bust],
    });
    breast.geometry.scale(1, 1, 1);
    if (!isMale) {
      const az = zC + bust * 0.92;
      add(g, ellipsoidGeometry(0.013, 0.013, 0.005, 16), 'mammary', 'surface', material(cols.areola, { roughness: 0.72 }), {
        position: v3(s * 0.066, 0.406, az), rotation: [0, s * 0.15, 0],
      });
      add(g, ellipsoidGeometry(0.005, 0.005, 0.004, 10), 'mammary', 'surface', material(cols.deep, { roughness: 0.6 }), {
        position: v3(s * 0.066, 0.404, az + 0.005),
      });
    }
  }

  /* ---------------- neck ---------------- */
  add(g, loftRows(bandRows(neckRows, neckRows[0][0], neckRows[neckRows.length - 1][0], 14), { seg: 30, capStart: false }), 'neck', 'surface', skinMat, {
    receiveShadow: true,
  });
  // thyroid prominence / Adam's apple — obvious on the male figure, soft on the female
  add(g, ellipsoidGeometry(0.012, 0.014 * (isMale ? 1.5 : 1), 0.008 * (isMale ? 1.6 : 1), 12), 'neck', 'surface', skinMat, {
    position: v3(0, 0.712, neckRows[2][2] + frontZ(neckRows, 0.712, 0) * 0.02 + 0.048),
  });
  for (const s of [1, -1]) {
    // sternocleidomastoid ridges, the two bands you see when you turn your head
    add(g, tubeGeometry([v3(s * 0.012, 0.744, 0.045), v3(s * 0.03, 0.706, 0.05), v3(s * 0.045, 0.664, 0.045)], 0.0075, 14, 6),
      'neck', 'surface', skinMat);
  }

  /* ---------------- head ---------------- */
  const HC = HEAD_CENTER_Z;
  add(g, loftRows(bandRows(headRows, headRows[0][0], headRows[headRows.length - 1][0], 26), { seg: 44, zc: HC }), 'head', 'surface', skinMat, {
    receiveShadow: true,
  });

  // face plate: a slightly softer, smoother skin patch over the front of the skull
  const faceRows = bandRows(headRows, 0.744, 0.848, 10);
  add(g, loftRows(faceRows.map(([y, rx, rz]) => [y, rx * 0.72, rz + 0.0025, rz * 0.6, 2.0]), { u0: 0.30, u1: 0.70, seg: 26, zc: HC }), 'face', 'surface', skinSoft);

  // jaw + chin: the face narrows to a point, which is what sells the profile
  add(g, blobGeometry(0.03, 3, 0.02, 4, 2), 'face', 'surface', skinMat, {
    position: v3(0, 0.731, HC + frontZ(headRows, 0.744, 0) * 0.78), scale: [1.15, 0.85, 0.72],
  });
  // brow ridge
  for (const s of [1, -1]) {
    add(g, tubeGeometry([v3(s * 0.006, 0.824, HC + frontZ(headRows, 0.824, 0) - 0.004), v3(s * 0.038, 0.826, HC + frontZ(headRows, 0.826, 0) - 0.008), v3(s * 0.062, 0.82, HC + frontZ(headRows, 0.82, 0) - 0.02)],
      0.006, 12, 6), 'face', 'surface', skinMat);
  }
  // nose: bridge, tip, alae and nostrils, lofted along its own curve
  const noseBridge = 0.818;
  add(g, limbLoft([
    v3(0, noseBridge, HC + frontZ(headRows, noseBridge, 0) - 0.016),
    v3(0, 0.798, HC + 0.078),
    v3(0, 0.78, HC + 0.088),
    v3(0, 0.77, HC + 0.084),
  ], [[0, 0.0055, 0.005], [0.42, 0.0075, 0.0085], [0.78, 0.0105, 0.010], [1, 0.0085, 0.009]], { steps: 14, seg: 14, k: 1 }),
    'face', 'surface', skinMat);
  for (const s of [1, -1]) {
    add(g, blobGeometry(0.0075, 2, 0.05, 5, s * 3), 'face', 'surface', skinMat, { position: v3(s * 0.0115, 0.7725, HC + 0.082), scale: [1, 0.85, 0.9] });
    add(g, ellipsoidGeometry(0.0042, 0.0028, 0.003, 10), 'face', 'surface', material('#3a2118', { roughness: 0.95 }), {
      position: v3(s * 0.0125, 0.7695, HC + 0.0855), rotation: [0, 0, s * 0.5],
    });
  }
  // lips: two soft cushions split by the mouth line
  const lipZ = HC + frontZ(headRows, 0.758, 0) - 0.003;
  const lipMat = lipMaterial(tone);
  for (const [dz, ry, y] of [[0.0042, 0.0042, 0.7555], [-0.0048, 0.0052, 0.7455]]) {
    const lip = add(g, blobGeometry(1, 3, 0.02, 3, 1), 'face', 'surface', lipMat, {
      position: v3(0, y, lipZ + dz * 0.4), scale: [0.023, ry, 0.0085 + Math.abs(dz) * 0.4],
    });
    lip.geometry.scale(1, 1, 1);
  }
  add(g, ellipsoidGeometry(0.019, 0.0016, 0.004, 12), 'face', 'surface', material('#5a2b28', { roughness: 0.7 }), {
    position: v3(0, 0.7505, lipZ + 0.0022),
  });
  for (const s of [1, -1]) {
    add(g, blobGeometry(0.006, 2, 0.04, 4, s * 5), 'face', 'surface', skinMat, { position: v3(s * 0.0225, 0.75, lipZ - 0.002), scale: [0.8, 1, 0.7] });
    // philtral columns + nasolabial fold, the faint lines either side of the mouth
    add(g, tubeGeometry([v3(s * 0.014, 0.768, lipZ + 0.006), v3(s * 0.019, 0.757, lipZ + 0.008), v3(s * 0.024, 0.744, lipZ + 0.002)], 0.0026, 10, 5),
      'face', 'surface', skinMat);
  }

  // eyes: sclera, iris, pupil, lids. The nervous system keeps the eyeball behind them.
  const eyeX = 0.0335;
  const eyeY = 0.802;
  const eyeZ = HC + frontZ(headRows, 0.802, 0) - 0.0125;
  for (const s of [1, -1]) {
    add(g, ellipsoidGeometry(0.0132, 0.0126, 0.0126, 18), 'face', 'surface', material('#f6f4ef', { roughness: 0.24, physical: true, clearcoat: 0.9, clearcoatRoughness: 0.06 }), {
      position: v3(s * eyeX, eyeY, eyeZ),
    });
    add(g, ellipsoidGeometry(0.0062, 0.0062, 0.0032, 16), 'face', 'surface', material(isMale ? '#4f6f7d' : '#5c4630', { roughness: 0.3, physical: true, clearcoat: 0.8 }), {
      position: v3(s * eyeX, eyeY - 0.0004, eyeZ + 0.0118),
    });
    add(g, ellipsoidGeometry(0.0027, 0.0029, 0.0018, 12), 'face', 'surface', material('#120d0b', { roughness: 0.4 }), {
      position: v3(s * eyeX, eyeY - 0.0004, eyeZ + 0.0128),
    });
    // upper lid: a skin flap cut into a crescent so the eye stays open
    for (const [dz, ry, y, sx] of [[0.0072, 0.0052, 0.0072, 1], [-0.0068, 0.0034, -0.0028, 0.94]]) {
      add(g, loftGeometry([
        { x: 0, y: 0, z: -0.0135, rx: sx * 0.0152, rz: ry, exp: 2 },
        { x: 0, y: 0, z: -0.004, rx: sx * 0.0168, rz: ry * 1.5, exp: 2 },
        { x: 0, y: 0, z: 0.004, rx: sx * 0.0162, rz: ry * 1.45, exp: 2 },
        { x: 0, y: 0, z: 0.0125, rx: sx * 0.014, rz: ry * 0.9, exp: 2 },
      ], { seg: 12, u0: 0, u1: 1, capStart: true, capEnd: true }), 'face', 'surface', skinMat, {
        position: v3(s * eyeX, eyeY + y, eyeZ + dz), rotation: [s * -0.06, 0, s * 0.1],
      });
    }
    // lashes
    add(g, tubeGeometry([v3(s * (eyeX - 0.014), eyeY + 0.004, eyeZ + 0.012), v3(s * eyeX, eyeY + 0.0085, eyeZ + 0.0155), v3(s * (eyeX + 0.013), eyeY + 0.005, eyeZ + 0.0125)], 0.0016, 10, 5),
      'face', 'surface', material('#241812', { roughness: 0.6 }), { castShadow: false });
    // brow
    add(g, placed(new THREE.TorusGeometry(0.019, 0.0031, 6, 16, Math.PI * 0.82), {
      position: v3(s * (eyeX + 0.001), eyeY + 0.0235, eyeZ + 0.0088),
      rotation: [Math.PI / 2 - 0.32, 0, s * (isMale ? 0.06 : 0.24)],
      scale: [1, 1.05, 0.55],
    }), 'face', 'surface', material(isMale ? tone.deep : '#54382a', { roughness: 0.8 }), { castShadow: false });
  }

  // ears: helix rim, antihelix, lobe — the pinna is a folded cartilage tube
  for (const s of [1, -1]) {
    const ear = mergeGeometries([
      placed(arcGeometry(0.0125, 0.0031, Math.PI * 1.32, 18, 6), { rotation: [0, 0, s * -0.25], position: v3(0.001 * s, 0.001, 0) }),
      placed(arcGeometry(0.0068, 0.0021, Math.PI * 1.05, 14, 5), { rotation: [0, 0, s * -0.15], position: v3(-0.0015 * s, -0.0005, 0.0012) }),
      placed(blobGeometry(0.0048, 2, 0.06, 4, s), { position: v3(-s * 0.0015, -0.0135, 0.0015), scale: [0.8, 1, 0.7] }),
      placed(blobGeometry(0.0035, 1, 0.05, 3, s * 2), { position: v3(s * 0.0035, -0.002, 0.0038), scale: [0.6, 1.1, 0.6] }),
    ]);
    add(g, ear, 'head', 'surface', skinMat, {
      position: v3(s * rowAt(headRows, 0.8).rx * 0.985, 0.7995, HC - 0.004),
      rotation: [0.1, s * 1.42, s * 0.12],
    });
    // the lobule sits just behind the jaw hinge
    add(g, ellipsoidGeometry(0.006, 0.0055, 0.0075, 12), 'head', 'surface', skinMat, {
      position: v3(s * rowAt(headRows, 0.79).rx * 0.95, 0.7795, HC - 0.012), scale: [0.7, 1, 1],
    });
  }

  /* ---------------- arms ---------------- */
  const armProf = limbProfile(LIMB_PROFILES.arm, p);
  const foreProf = limbProfile(LIMB_PROFILES.forearm, p);
  for (const s of [1, -1]) {
    const sh = v3(s * sideX(trunk, 0.545) * 0.92, 0.545, 0.004);
    const el = v3(s * 0.2195, 0.30, 0.006);
    const wr = s > 0 ? v3(s * 0.2305, 0.05, 0.012) : v3(s * 0.2305, 0.05, 0.012);

    // deltoid cap: the shoulder is a ball in a shelf, not a sphere on a stick
    add(g, blobGeometry(1, 3, 0.02, 4, s * 2), 'shoulder', 'surface', skinMat, {
      position: v3(s * 0.167, 0.541, 0.002), scale: [0.055, 0.06, 0.054],
    });
    // the trapezius slope: soft tissue running from the neck out to the point
    // of the shoulder, which is what makes the shoulders read as shoulders
    add(g, blobGeometry(1, 3, 0.03, 4, s * 5), 'shoulder', 'surface', skinMat, {
      position: v3(s * 0.108, 0.573, -0.004), scale: [0.072, 0.038, 0.058],
      rotation: [0, 0, s * -0.4], receiveShadow: true,
    });
    add(g, limbLoft([sh, v3(s * 0.206, 0.43, 0.006), el], armProf, { steps: 22, seg: 22, capEnd: false }), 'arm', 'surface', skinMat, {
      receiveShadow: true,
    });
    // elbow: the olecranon point behind, the hollow crease in front
    add(g, ellipsoidGeometry(0.034, 0.032, 0.033, 16), 'elbow', 'surface', skinMat, { position: v3(s * 0.2205, 0.3, 0.004) });
    add(g, blobGeometry(0.0125, 2, 0.1, 6, s), 'elbow', 'surface', skinMat, { position: v3(s * 0.2225, 0.306, -0.024), scale: [0.85, 1.15, 0.8] });
    add(g, limbLoft([el, v3(s * 0.2265, 0.17, 0.009), wr], foreProf, { steps: 20, seg: 20 }), 'forearm', 'surface', skinMat, {
      receiveShadow: true,
    });
    // wrist bones show through as two bumps
    for (const e of [1, -1]) {
      add(g, ellipsoidGeometry(0.0075, 0.006, 0.0075, 10), 'hand', 'surface', skinMat, { position: v3(s * (0.2305 + e * 0.014), 0.052, 0.012) });
    }
    buildHand(g, s, { skinMat, palmMat: skinSoft, cols, p });
    buildFootLeg(g, s, { skinMat, cols, p, isMale });
  }

  return g;
}

/* ------------------------------------------------------------------ *
 * Hand: palm, four fingers fanned off the middle ray, and an opposable thumb.
 * ------------------------------------------------------------------ */
function buildHand(g, s, { skinMat, palmMat, cols, p }) {
  const wrist = v3(s * 0.2305, 0.048, 0.012);
  const palmMid = v3(s * 0.2335, -0.006, 0.014);
  const palmEnd = v3(s * 0.2345, -0.031, 0.016);

  // palm: a flat, slightly cupped wedge (small exponent → rounded rectangle)
  add(g, limbLoft([wrist, palmMid, palmEnd], PALM_PROFILE.map(([t, rx, rz, exp]) => [t, rx, rz, exp]), {
    steps: 16, seg: 22, capEnd: true,
  }), 'hand', 'surface', palmMat, { receiveShadow: true });
  // thenar eminence: the fleshy mound at the base of the thumb
  add(g, blobGeometry(1, 3, 0.04, 4, s * 3), 'hand', 'surface', skinMat, {
    position: v3(s * (0.2345 + 0.019), -0.012, 0.019), scale: [0.016, 0.024, 0.011],
  });
  // hypothenar mound on the little-finger side
  add(g, blobGeometry(1, 2, 0.04, 4, s * 5), 'hand', 'surface', skinMat, {
    position: v3(s * (0.2345 - 0.02), -0.014, 0.016), scale: [0.012, 0.022, 0.009],
  });

  const baseY = -0.033;
  const spread = [-0.0075, -0.0025, 0.0025, 0.0075];   // relative to the middle ray
  const offX = [0.0155, 0.005, -0.0055, -0.016];        // index is lateral (thumb side)
  for (let f = 0; f < 4; f++) {
    const len = 0.046 * FINGER_LENGTHS[f];
    const cx = s * (0.2345 + offX[f]);
    const curl = 0.004 + f * 0.0012;
    const pts = [
      v3(cx + s * spread[f] * 0.5, baseY, 0.017),
      v3(cx + s * spread[f] * 1.1, baseY - len * 0.5, 0.017 + curl),
      v3(cx + s * spread[f] * 1.5, baseY - len, 0.016 + curl * 2.4),
    ];
    const prof = [
      [0, 0.0062, 0.0058, 2.1],
      [0.3, 0.0058, 0.0055, 2.1],
      [0.5, 0.0063, 0.006, 2.1],
      [0.72, 0.0052, 0.005, 2.1],
      [0.88, 0.0056, 0.0054, 2.1],
      [1, 0.0044, 0.0043, 2.2],
    ];
    add(g, limbLoft(pts, prof, { steps: 14, seg: 12, capEnd: true, k: 0.94 + p.muscle * 0.06 }), 'hand', 'surface', skinMat);
  }
  // thumb: two phalanges set at an angle to the palm
  const t0 = v3(s * 0.2235, 0.006, 0.022);
  const t1 = v3(s * 0.2065, -0.014, 0.032);
  const t2 = v3(s * 0.1965, -0.03, 0.036);
  add(g, limbLoft([t0, t1, t2], [
    [0, 0.0085, 0.008, 2.1],
    [0.45, 0.0075, 0.0072, 2.1],
    [0.72, 0.0068, 0.0066, 2.1],
    [1, 0.0058, 0.0056, 2.2],
  ], { steps: 14, seg: 14, capEnd: true }), 'hand', 'surface', skinMat);
}

/* ------------------------------------------------------------------ *
 * Leg: thigh → knee → calf → foot with five toes.
 * ------------------------------------------------------------------ */
function buildFootLeg(g, s, { skinMat, cols, p, isMale }) {
  const hip = v3(s * 0.0885, -0.03, 0.004);
  const knee = v3(s * 0.0925, -0.45, 0.006);
  const ankle = v3(s * 0.0895, -0.832, -0.006);
  const thighProf = limbProfile(LIMB_PROFILES.thigh, p);
  const legProf = limbProfile(LIMB_PROFILES.leg, p);

  add(g, limbLoft([hip, v3(s * 0.0905, -0.24, 0.005), knee], thighProf, { steps: 26, seg: 26 }), 'thigh', 'surface', skinMat, {
    receiveShadow: true,
  });
  // knee: patella in front, the hollow of the popliteal fossa behind
  add(g, ellipsoidGeometry(0.0455, 0.043, 0.0435, 18), 'knee', 'surface', skinMat, { position: v3(s * 0.0925, -0.45, 0.004), receiveShadow: true });
  // patella: a flat bone just under the skin, with the ligament running below it
  add(g, placed(ellipsoidGeometry(0.019, 0.021, 0.008, 16), { rotation: [0.1, 0, 0] }), 'knee', 'surface', skinMat, {
    position: v3(s * 0.0925, -0.451, 0.0405),
  });
  for (const e of [1, -1]) {
    add(g, ellipsoidGeometry(0.011, 0.013, 0.011, 10), 'knee', 'surface', skinMat, { position: v3(s * (0.0925 + e * 0.036), -0.452, 0.014) });
  }
  add(g, blobGeometry(0.012, 2, 0.08, 5, s), 'knee', 'surface', skinMat, { position: v3(s * 0.0925, -0.482, 0.036), scale: [1.2, 1.5, 0.55] });

  add(g, limbLoft([knee, v3(s * 0.0905, -0.62, -0.002), ankle], legProf, {
    steps: 26, seg: 24, offset: (t) => [0, -0.012 * Math.sin(Math.PI * Math.min(1, t * 1.2))],
  }), 'leg', 'surface', skinMat, { receiveShadow: true });
  // the calf's medial head is bigger, and the achilles is a cord you can grab
  add(g, blobGeometry(1, 3, 0.03, 4, s * 2), 'leg', 'surface', skinMat, {
    position: v3(s * (0.0905 - 0.024), -0.602, -0.03), scale: [0.026, 0.062, 0.032],
  });
  add(g, limbLoft([v3(s * 0.0905, -0.66, -0.034), v3(s * 0.0895, -0.79, -0.028), v3(s * 0.089, -0.85, -0.008)],
    [[0, 0.0125, 0.010], [0.5, 0.0095, 0.0085], [0.85, 0.0075, 0.007], [1, 0.0085, 0.008]], { steps: 14, seg: 10 }),
    'leg', 'surface', skinMat);

  /* ---- foot: heel → arch → ball → toes, sole flattened, dorsum domed ---- */
  const footPath = [
    v3(s * 0.089, -0.826, -0.036),
    v3(s * 0.089, -0.866, -0.028),
    v3(s * 0.089, -0.884, 0.012),
    v3(s * 0.089, -0.881, 0.062),
    v3(s * 0.089, -0.874, 0.108),
    v3(s * 0.089, -0.866, 0.132),
  ];
  const footProf = [
    [0, 0.0255, 0.026, 2.1, 0.024],
    [0.16, 0.0315, 0.029, 2.15, 0.026],
    [0.4, 0.0325, 0.02, 2.4, 0.012],
    [0.66, 0.0375, 0.019, 2.5, 0.0095],
    [0.86, 0.0335, 0.016, 2.6, 0.0085],
    [1, 0.028, 0.013, 2.7, 0.008],
  ];
  add(g, limbLoft(footPath, footProf, { steps: 26, seg: 22, capEnd: true }), 'foot', 'surface', skinMat, { receiveShadow: true });
  // the medial arch, most visible on a flat-footed or risen heel
  add(g, blobGeometry(1, 2, 0.03, 4, 1), 'foot', 'surface', skinMat, {
    position: v3(s * (0.089 - 0.016), -0.862, 0.04), scale: [0.014, 0.02, 0.042],
  });

  const toeSizes = [0.0125, 0.0108, 0.0096, 0.0085, 0.0074];
  const toeLen = [0.024, 0.021, 0.019, 0.016, 0.013];
  for (let i = 0; i < 5; i++) {
    const x = s * 0.089 + s * (-0.017 + i * 0.0104);
    const z0 = 0.126 - i * 0.004;
    const r = toeSizes[i] * (isMale ? 1.06 : 1);
    add(g, limbLoft([
      v3(x, -0.874, z0 - 0.01),
      v3(x, -0.872 - i * 0.0006, z0 + toeLen[i] * 0.6),
      v3(x, -0.873 - i * 0.0012, z0 + toeLen[i]),
    ], [
      [0, r * 0.95, r * 0.62, 2.2, r * 0.5],
      [0.55, r, r * 0.66, 2.2, r * 0.5],
      [1, r * 0.78, r * 0.52, 2.3, r * 0.42],
    ], { steps: 8, seg: 10, capEnd: true }), 'foot', 'surface', skinMat);
  }
}

/* ------------------------------------------------------------------ *
 * Integumentary system: the skin as an organ, hair, nails, glands.
 * ------------------------------------------------------------------ */
export function buildIntegumentary({ variant = 'female', skin = DEFAULT_TONE } = {}) {
  const g = new THREE.Group();
  g.name = 'integumentary';

  const p = PROPORTIONS[variant] ?? PROPORTIONS.female;
  const tone = toneById(skin);
  const isMale = variant === 'male';
  const trunk = trunkSections(p);
  const { head: headRows } = headNeckSections(p);

  // translucent skin envelope: an inflated copy of the swept figure, so the
  // layer that "is" the integumentary system wraps the real body shape
  const shellMat = skinMaterial(tone, { opacity: 0.19, roughness: 0.3, clearcoat: 0.5, normalScale: 0.2, retile: [3, 3] });
  shellMat.side = THREE.DoubleSide;
  shellMat.transparent = true;
  shellMat.depthWrite = false;
  const shell = new THREE.Group();
  shell.name = 'skin-envelope';
  const INFL = 0.006;
  const shellLoft = (rows, opts) => loftRows(inflateRows(rows, INFL), opts);
  add(shell, shellLoft(bandRows(trunk, -0.214, 0.682, 34), { seg: 46 }), 'skin', 'integumentary', shellMat, { pickable: false });
  add(shell, shellLoft(bandRows(headRows, headRows[0][0], headRows[headRows.length - 1][0], 24), { seg: 34, zc: HEAD_CENTER_Z }), 'skin', 'integumentary', shellMat, { pickable: false });
  for (const s of [1, -1]) {
    add(shell, limbLoft([v3(s * 0.196, 0.545, 0.004), v3(s * 0.2205, 0.3, 0.006), v3(s * 0.2315, 0.05, 0.012)],
      [[0, 0.066, 0.064], [0.3, 0.058, 0.056], [0.62, 0.048, 0.047], [1, 0.03, 0.029]], { steps: 18, seg: 16 }),
      'skin', 'integumentary', shellMat, { pickable: false });
    add(shell, limbLoft([v3(s * 0.248, -0.075, 0.022), v3(s * 0.186, -0.075, 0.022)], [[0, 0.05, 0.045], [1, 0.05, 0.045]], { steps: 4, seg: 10 }),
      'skin', 'integumentary', shellMat, { pickable: false });
    add(shell, limbLoft([v3(s * 0.0885, -0.036, 0.004), v3(s * 0.0925, -0.45, 0.006), v3(s * 0.0895, -0.836, -0.006)],
      [[0, 0.094, 0.09], [0.4, 0.072, 0.07], [0.72, 0.058, 0.062], [1, 0.03, 0.031]], { steps: 20, seg: 16 }),
      'skin', 'integumentary', shellMat, { pickable: false });
    add(shell, limbLoft([v3(s * 0.089, -0.826, -0.042), v3(s * 0.089, -0.89, 0.02), v3(s * 0.089, -0.874, 0.16)],
      [[0, 0.036, 0.036], [0.5, 0.043, 0.03], [1, 0.034, 0.024]], { steps: 14, seg: 14 }),
      'skin', 'integumentary', shellMat, { pickable: false });
  }
  shell.visible = false;
  g.add(shell);

  /* ---------------- hair ---------------- */
  const hairCol = isMale ? shadeHex(tone.deep, -0.15) : shadeHex(tone.deep, -0.05);
  const hairMat = hairMaterial(hairCol);
  // the cap: the skull, inflated, cut away from the face
  const capRows = bandRows(headRows, 0.792, headRows[headRows.length - 1][0], 14).map(([y, rx, rz, rzb, exp]) => [y, rx * 1.05, rz * 1.045, rzb * 1.075, exp]);
  add(g, loftRows(capRows, { seg: 40, u0: 0.13, u1: 0.87, zc: HEAD_CENTER_Z - 0.001 }), 'hair', 'integumentary', hairMat, { castShadow: true });
  // fringe over the forehead: a thin shell that follows the hairline
  add(g, loftRows(bandRows(headRows, 0.816, 0.846, 6).map(([y, rx, rz, rzb, exp]) => [y, rx * (1.06 - (y - 0.816) * 0.5), rz * 1.06, rzb, exp]), { seg: 24, u0: 0.3, u1: 0.7, zc: HEAD_CENTER_Z }),
    'hair', 'integumentary', hairMat);
  // strands: hundreds of hairs read as flow, so the surface is not a helmet
  const strands = [];
  const strandCount = isMale ? 46 : 78;
  for (let i = 0; i < strandCount; i++) {
    const u = i / strandCount;
    const phi = (0.16 + 0.68 * u) * TAU;                    // around the head, front → back
    const drop = 0.1 + 0.16 * Math.abs(Math.sin(u * 9.1));  // how far it hangs
    const pts = [];
    const steps = 6;
    for (let k = 0; k <= steps; k++) {
      const t = k / steps;
      const y = 0.846 + 0.062 * Math.sin(Math.PI * (0.5 + 0.5 * t)) - t * drop * (isMale ? 0.5 : 1);
      const row = rowAt(headRows, Math.max(headRows[0][0], Math.min(0.912, y)));
      const spread = 1 + 0.1 * t + (isMale ? 0 : 0.06 * t * t);
      const front = Math.cos(phi);
      const zc = HEAD_CENTER_Z - 0.004 - (isMale ? 0 : 0.028 * t * t * Math.max(0, -front));
      pts.push(v3(row[1] * spread * Math.sin(phi) * 1.02, y, zc + row[3] * spread * front));
    }
    strands.push(placed(tubeGeometry(pts, 0.0018 + (i % 3) * 0.0004, 10, 4), {}));
  }
  add(g, mergeGeometries(strands), 'hair', 'integumentary', hairMat, { pickable: false });

  // for the longer style, a mantle of hair down the back of the head
  if (!isMale) {
    add(g, limbLoft([
      v3(0, 0.872, HEAD_CENTER_Z - 0.05),
      v3(0, 0.812, HEAD_CENTER_Z - 0.104),
      v3(0, 0.744, HEAD_CENTER_Z - 0.104),
      v3(0, 0.676, HEAD_CENTER_Z - 0.076),
    ], [
      [0, 0.055, 0.03, 2.2],
      [0.35, 0.078, 0.038, 2.3],
      [0.7, 0.086, 0.04, 2.4],
      [1, 0.058, 0.03, 2.5],
    ], { steps: 20, seg: 20, capEnd: true }), 'hair', 'integumentary', hairMat, { receiveShadow: true });
  }

  /* ---------------- nails ---------------- */
  const nailMat = nailMaterial('#f0d7c6');
  const baseY = -0.033;
  const offX = [0.0155 + 0.004, 0.005, -0.0055, -0.016 - 0.004];
  for (const s of [1, -1]) {
    for (let f = 0; f < 4; f++) {
      const len = 0.046 * FINGER_LENGTHS[f];
      const cx = s * (0.2345 + offX[f]) + s * (f < 2 ? 0.0037 : -0.0037) * 1.5;
      const y = baseY - len - 0.004;
      add(g, placed(roundedBoxGeometry(0.0085, 0.011, 0.0028, 0.0022), {
        position: v3(cx, y, 0.0145 + (0.004 + f * 0.0012) * 2.0),
        rotation: [0.16, 0, s * 0.06],
      }), 'hair', 'integumentary', nailMat, { castShadow: false });
    }
    // thumbnail
    add(g, placed(roundedBoxGeometry(0.0095, 0.0115, 0.003, 0.0024), {
      position: v3(s * 0.1935, -0.0345, 0.0405), rotation: [0.5, 0, s * 0.72],
    }), 'hair', 'integumentary', nailMat, { castShadow: false });
    // toenails on the five toes
    const toeSizes = [0.0125, 0.0108, 0.0096, 0.0085, 0.0074];
    const toeLen = [0.024, 0.021, 0.019, 0.016, 0.013];
    for (let i = 0; i < 5; i++) {
      const x = s * 0.089 + s * (-0.017 + i * 0.0104);
      const z0 = 0.126 - i * 0.004;
      const r = toeSizes[i];
      add(g, placed(roundedBoxGeometry(r * 1.5, r * 1.1, 0.0022, 0.0012), {
        position: v3(x, -0.873 - i * 0.0012 + r * 0.42, z0 + toeLen[i] * 0.86),
        rotation: [-0.15, 0, 0],
      }), 'hair', 'integumentary', nailMat, { castShadow: false });
    }
  }

  /* ---------------- accessory organs ---------------- */
  // sweat glands: coiled tubes threaded through the dermis
  for (let i = 0; i < 18; i++) {
    const a = i * 2.399963;
    const y = 0.48 - (i / 18) * 0.52;
    const row = rowAt(trunk, y);
    const rr = 1.008;
    const r = row[2] * rr;
    const pnt = v3(Math.sin(a) * row[1] * rr * 0.92, y, Math.cos(a) * r + 0.006 * Math.sign(Math.cos(a)));
    add(g, new THREE.TorusGeometry(0.006, 0.0016, 6, 10, Math.PI * 1.6), 'sweat-glands', 'integumentary', material('#8fbfa8', { roughness: 0.5 }), {
      position: pnt, rotation: [a, Math.atan2(pnt.x, pnt.z), 0],
    });
  }
  // touch receptors concentrated where the skin is thinnest: fingertips and lips
  for (const s of [1, -1]) {
    for (let f = 0; f < 4; f++) {
      const len = 0.046 * FINGER_LENGTHS[f];
      add(g, blobGeometry(0.0045, 1, 0.12, 6, f + s), 'touch-receptors', 'integumentary', material('#f0a3c0', { roughness: 0.4, emissive: 0x210a12 }), {
        position: v3(s * (0.2345 + offX[f] * 0.8), baseY - len + 0.004, 0.02),
      });
    }
  }

  /* ---------------- histology anchor: layered skin block ---------------- */
  const block = new THREE.Group();
  block.name = 'skin-block';
  block.visible = false;
  const layers = [
    [tone.base, 0.006, 0.032, 'epidermis'],
    [tone.shade, 0.018, -0.004, 'dermis'],
    ['#f3e2b6', 0.022, -0.032, 'dermis'],
  ];
  layers.forEach(([c, h, y, part]) => {
    add(block, roundedBoxGeometry(0.11, h * 2, 0.09, 0.004), part, 'integumentary', material(c, { roughness: 0.7 }), { position: v3(0, y, 0) });
  });
  // hair shaft + follicle, sebaceous gland, sweat coil: what a skin section shows
  add(block, limbLoft([v3(0.02, 0.012, 0.02), v3(0.018, -0.03, 0.016)], [[0, 0.0035, 0.0035], [1, 0.0026, 0.0026]], { steps: 8, seg: 8, capStart: true }),
    'hair', 'integumentary', hairMaterial(hairCol));
  add(block, blobGeometry(0.016, 2, 0.16, 6, 2), 'hair', 'integumentary', material('#e8d7a0', { roughness: 0.6 }), { position: v3(0.036, -0.014, 0.014), scale: [1, 0.8, 0.8] });
  add(block, tubeGeometry([v3(-0.03, 0.02, 0.01), v3(-0.032, -0.012, 0.014), v3(-0.024, -0.03, 0.006), v3(-0.036, -0.04, 0.016)], 0.004, 24, 6),
    'sweat-glands', 'integumentary', material('#9ecfbe', { roughness: 0.5 }));
  g.add(block);

  return g;
}

/* ------------------------------------------------------------------ */
function shadeHex(hex, amount) {
  const c = new THREE.Color(hex);
  c.offsetHSL(0, 0, amount);
  return `#${c.getHexString()}`;
}

export default buildSurface;

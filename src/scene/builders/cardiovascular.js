import * as THREE from 'three';
import { add, blobGeometry, ellipsoidGeometry, tubeGeometry, v3 } from '../helpers.js';

const HEART = '#d6413c';
const HEART_D = '#a92f2c';
const ART = '#e0504f';
const VEIN = '#5a76b8';

export function buildCardiovascular() {
  const g = new THREE.Group();
  g.name = 'cardiovascular';

  /* ---------------- heart ---------------- */
  const heart = add(g, blobGeometry(0.052, 3, 0.06, 7, 1.7), 'heart', 'cardiovascular', HEART, {
    position: v3(-0.012, 0.30, 0.028), rotation: [0.25, 0.2, -0.35], scale: [1, 1.15, 0.95],
  });
  heart.userData.beating = true;
  // apex
  add(g, blobGeometry(0.026, 2, 0.05, 6, 4), 'heart', 'cardiovascular', HEART, { position: v3(-0.045, 0.255, 0.05), rotation: [0, 0, -0.5] });
  // atria
  add(g, ellipsoidGeometry(0.026, 0.022, 0.022, 16), 'heart-chambers', 'cardiovascular', HEART_D, { position: v3(0.03, 0.345, 0.03) });
  add(g, ellipsoidGeometry(0.024, 0.02, 0.022, 16), 'heart-chambers', 'cardiovascular', '#b83a36', { position: v3(-0.045, 0.34, 0.016) });
  // valve planes
  const valves = [
    [v3(-0.02, 0.335, 0.03), 0.019],
    [v3(-0.005, 0.315, 0.035), 0.022],
  ];
  valves.forEach(([p, r], i) => {
    add(g, new THREE.TorusGeometry(r, 0.004, 6, 18), 'heart-valves', 'cardiovascular', '#f4e0c8', {
      position: p, rotation: [Math.PI / 2 - 0.3, 0, 0],
    });
  });
  // coronary arteries
  add(g, tubeGeometry([
    v3(-0.005, 0.352, 0.048), v3(-0.02, 0.33, 0.06), v3(-0.04, 0.29, 0.062), v3(-0.045, 0.26, 0.055),
  ], 0.006, 30, 8), 'coronary', 'cardiovascular', '#8f1f1c');
  add(g, tubeGeometry([
    v3(0.0, 0.35, 0.05), v3(0.015, 0.335, 0.06), v3(0.025, 0.31, 0.055), v3(0.02, 0.285, 0.045),
  ], 0.005, 30, 8), 'coronary', 'cardiovascular', '#8f1f1c');

  /* ---------------- aorta ---------------- */
  add(g, tubeGeometry([
    v3(-0.005, 0.318, 0.03), v3(0.0, 0.36, 0.028), v3(0.005, 0.40, 0.012),
    v3(0.0, 0.415, -0.018), v3(-0.012, 0.40, -0.035), v3(-0.012, 0.34, -0.04),
    v3(-0.012, 0.22, -0.045), v3(-0.012, 0.08, -0.042), v3(-0.01, -0.02, -0.035), v3(-0.01, -0.062, -0.028),
  ], 0.0135, 90, 10), 'aorta', 'cardiovascular', ART);
  // arch branches
  add(g, tubeGeometry([v3(0.0, 0.418, -0.014), v3(0.012, 0.46, 0.0), v3(0.02, 0.53, 0.012), v3(0.026, 0.6, 0.012)], 0.007, 30, 8), 'arteries', 'cardiovascular', ART);
  add(g, tubeGeometry([v3(-0.004, 0.422, -0.016), v3(-0.014, 0.47, -0.008), v3(-0.022, 0.53, 0.006), v3(-0.03, 0.6, 0.012)], 0.0055, 30, 8), 'arteries', 'cardiovascular', ART);
  add(g, tubeGeometry([v3(-0.008, 0.42, -0.018), v3(-0.04, 0.45, -0.01), v3(-0.1, 0.5, 0.0), v3(-0.16, 0.53, 0.006)], 0.006, 30, 8), 'arteries', 'cardiovascular', ART);
  add(g, tubeGeometry([v3(0.004, 0.418, -0.012), v3(0.06, 0.45, -0.005), v3(0.13, 0.51, 0.002), v3(0.17, 0.54, 0.008)], 0.006, 30, 8), 'arteries', 'cardiovascular', ART);
  // carotids up the neck to the head
  for (const s of [1, -1]) {
    add(g, tubeGeometry([
      v3(s * 0.024, 0.6, 0.012), v3(s * 0.03, 0.66, 0.02), v3(s * 0.032, 0.72, 0.03), v3(s * 0.028, 0.79, 0.03),
    ], 0.006, 30, 8), 'arteries', 'cardiovascular', ART);
  }
  // abdominal branches
  add(g, tubeGeometry([v3(-0.012, 0.05, -0.04), v3(0.02, 0.06, -0.03), v3(0.06, 0.07, -0.02)], 0.006, 20, 8), 'arteries', 'cardiovascular', ART);
  add(g, tubeGeometry([v3(-0.012, 0.0, -0.038), v3(-0.01, 0.0, -0.01), v3(0.0, 0.02, 0.03)], 0.0055, 20, 8), 'arteries', 'cardiovascular', ART);
  add(g, tubeGeometry([v3(-0.011, -0.05, -0.034), v3(0.01, -0.05, 0.0), v3(0.02, -0.04, 0.04)], 0.005, 20, 8), 'arteries', 'cardiovascular', ART);
  for (const s of [1, -1]) {
    add(g, tubeGeometry([v3(-0.012, -0.02, -0.036), v3(s * 0.05, -0.03, -0.04), v3(s * 0.062, -0.05, -0.04)], 0.0055, 20, 8), 'arteries', 'cardiovascular', ART);
    // iliac -> femoral -> popliteal -> tibial
    add(g, tubeGeometry([
      v3(-0.011, -0.062, -0.028), v3(s * 0.045, -0.07, -0.015), v3(s * 0.075, -0.04, 0.01),
      v3(s * 0.086, -0.3, 0.016), v3(s * 0.09, -0.46, 0.0), v3(s * 0.088, -0.62, -0.012), v3(s * 0.086, -0.8, -0.008),
    ], 0.0065, 60, 8), 'arteries', 'cardiovascular', ART);
    // subclavian -> brachial -> radial/ulnar
    add(g, tubeGeometry([
      v3(s * 0.03, 0.55, 0.008), v3(s * 0.12, 0.545, 0.008), v3(s * 0.18, 0.52, 0.012),
      v3(s * 0.2, 0.4, 0.018), v3(s * 0.218, 0.3, 0.02), v3(s * 0.228, 0.16, 0.018), v3(s * 0.234, 0.05, 0.014),
    ], 0.0055, 60, 8), 'arteries', 'cardiovascular', ART);
  }

  /* ---------------- veins ---------------- */
  // SVC
  add(g, tubeGeometry([
    v3(0.02, 0.55, 0.005), v3(0.026, 0.48, 0.012), v3(0.032, 0.4, 0.02), v3(0.03, 0.35, 0.026),
  ], 0.011, 30, 8), 'vena-cava', 'cardiovascular', VEIN);
  for (const s of [1, -1]) {
    add(g, tubeGeometry([v3(s * 0.035, 0.66, 0.026), v3(s * 0.03, 0.6, 0.012), v3(0.02, 0.56, 0.006)], 0.0075, 20, 8), 'veins', 'cardiovascular', VEIN);
  }
  // IVC
  add(g, tubeGeometry([
    v3(0.012, -0.055, -0.016), v3(0.014, 0.0, -0.012), v3(0.018, 0.08, -0.005),
    v3(0.022, 0.2, 0.006), v3(0.028, 0.27, 0.016),
  ], 0.012, 50, 8), 'vena-cava', 'cardiovascular', VEIN);
  for (const s of [1, -1]) {
    add(g, tubeGeometry([
      v3(s * 0.086, -0.8, -0.002), v3(s * 0.09, -0.6, 0.004), v3(s * 0.09, -0.45, 0.012),
      v3(s * 0.08, -0.17, 0.008), v3(s * 0.04, -0.075, -0.004), v3(0.012, -0.055, -0.016),
    ], 0.008, 50, 8), 'veins', 'cardiovascular', VEIN);
    add(g, tubeGeometry([
      v3(s * 0.236, 0.045, 0.02), v3(s * 0.23, 0.16, 0.03), v3(s * 0.222, 0.3, 0.028),
      v3(s * 0.19, 0.45, 0.03), v3(s * 0.12, 0.53, 0.02), v3(0.02, 0.55, 0.005),
    ], 0.007, 50, 8), 'veins', 'cardiovascular', VEIN);
    // renal veins
    add(g, tubeGeometry([v3(s * 0.062, 0.05, -0.04), v3(s * 0.03, 0.02, -0.01), v3(0.016, 0.0, -0.01)], 0.006, 20, 8), 'veins', 'cardiovascular', VEIN);
  }
  // pulmonary vessels
  add(g, tubeGeometry([v3(0.0, 0.35, 0.02), v3(0.02, 0.38, -0.01), v3(0.03, 0.38, -0.03)], 0.009, 20, 8), 'aorta', 'cardiovascular', '#8f5fa8');
  for (const s of [1, -1]) {
    add(g, tubeGeometry([v3(0.03, 0.38, -0.03), v3(s * 0.05, 0.375, -0.03), v3(s * 0.07, 0.37, -0.025)], 0.007, 20, 8), 'arteries', 'cardiovascular', '#8f5fa8');
    add(g, tubeGeometry([v3(s * 0.06, 0.33, -0.01), v3(s * 0.03, 0.335, 0.01), v3(0.014, 0.34, 0.02)], 0.006, 20, 8), 'veins', 'cardiovascular', '#c96fa8');
  }

  /* ---------------- histology anchors (micro view) ---------------- */
  const bloodModel = new THREE.Group();
  bloodModel.name = 'blood-model';
  bloodModel.visible = false;
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const rbc = add(bloodModel, new THREE.SphereGeometry(0.028, 16, 10), 'red-blood-cell', 'cardiovascular', '#c8352f', {
      position: v3(Math.cos(a) * 0.07, 0, Math.sin(a) * 0.07), scale: [1, 0.35, 1],
    });
    rbc.geometry.scale(1, 0.4, 1);
  }
  add(bloodModel, blobGeometry(0.045, 2, 0.15, 6, 2), 'white-blood-cell', 'cardiovascular', '#e8e2f0', { position: v3(0, 0.02, -0.09) });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    add(bloodModel, ellipsoidGeometry(0.012, 0.005, 0.012, 10), 'platelets', 'cardiovascular', '#d8a0a8', {
      position: v3(0.1 + Math.cos(a) * 0.03, -0.02, 0.06 + Math.sin(a) * 0.03),
    });
  }
  g.add(bloodModel);

  // Laterality correction: the model above was authored mirrored across the
  // sagittal plane. Flipping X puts the apex, arch, SVC and IVC on the correct
  // side (three.js flips the winding order automatically for negative
  // determinants, so lighting and back-face culling stay correct).
  g.scale.x = -1;

  return g;
}

export default buildCardiovascular;

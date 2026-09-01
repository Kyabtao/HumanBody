import * as THREE from 'three';
import { add, blobGeometry, ellipsoidGeometry, tubeGeometry, v3, material, SPINE_PATH } from '../helpers.js';

const N = '#d7c78a';        // nerve tissue
const BRAIN = '#c9b6dd';    // cerebrum tint
const CBL = '#c0a9b8';
const EYE = '#f2f2f0';

export function buildNervous() {
  const g = new THREE.Group();
  g.name = 'nervous';

  /* ---------------- brain ---------------- */
  // two cerebral hemispheres with gyri-like displacement
  for (const s of [1, -1]) {
    const hemi = add(g, blobGeometry(0.052, 3, 0.055, 13, s * 2.1), 'brain', 'nervous', BRAIN, {
      position: v3(s * 0.027, 0.815, 0.002), scale: [0.95, 1.0, 1.2],
    });
    // lobes: frontal, parietal/temporal, occipital
    add(g, blobGeometry(0.03, 2, 0.07, 11, 3), 'cerebrum', 'nervous', BRAIN, { position: v3(s * 0.032, 0.812, 0.055), scale: [1, 1, 1.1] });
    add(g, blobGeometry(0.028, 2, 0.07, 11, 5), 'cerebrum', 'nervous', BRAIN, { position: v3(s * 0.05, 0.79, 0.015) });
    add(g, blobGeometry(0.026, 2, 0.07, 11, 7), 'cerebrum', 'nervous', BRAIN, { position: v3(s * 0.026, 0.822, -0.055), scale: [1, 0.9, 1] });
  }
  // cerebellum + brainstem
  for (const s of [1, -1]) {
    add(g, blobGeometry(0.027, 2, 0.1, 22, s), 'cerebellum', 'nervous', CBL, { position: v3(s * 0.024, 0.782, -0.05), scale: [1, 0.8, 1] });
  }
  add(g, tubeGeometry([v3(0, 0.815, -0.012), v3(0, 0.795, -0.008), v3(0, 0.76, 0.008)], 0.019, 16, 10), 'brainstem', 'nervous', N);
  // thalamus / hypothalamus / pineal
  for (const s of [1, -1]) {
    add(g, ellipsoidGeometry(0.014, 0.018, 0.02, 12), 'thalamus', 'nervous', '#e0cba0', { position: v3(s * 0.015, 0.808, -0.005) });
  }
  add(g, ellipsoidGeometry(0.012, 0.009, 0.012, 12), 'hypothalamus', 'nervous', '#e8b7a0', { position: v3(0, 0.795, 0.016) });
  add(g, ellipsoidGeometry(0.007, 0.009, 0.008, 10), 'pineal', 'endocrine', '#d8a6d8', { position: v3(0, 0.828, -0.022) });
  // pituitary (endocrine) hangs below the hypothalamus
  add(g, ellipsoidGeometry(0.009, 0.008, 0.009, 12), 'pituitary', 'endocrine', '#e6a8d0', { position: v3(0, 0.784, 0.024) });
  // meninges: translucent shell
  const meninges = new THREE.Mesh(ellipsoidGeometry(0.075, 0.062, 0.088, 20), material('#cfe0f2', { opacity: 0.18, transparent: true, depthWrite: false, roughness: 0.25 }));
  meninges.position.set(0, 0.815, -0.005);
  meninges.userData = { partId: 'meninges', system: 'nervous', pickable: true, baseMaterial: meninges.material };
  g.add(meninges);

  /* ---------------- spinal cord + nerves ---------------- */
  const cordPts = SPINE_PATH.slice(0, 10).map((p) => v3(p.x, p.y - 0.004, p.z + 0.014));
  cordPts.unshift(v3(0, 0.75, 0.006));
  add(g, tubeGeometry(cordPts, 0.0105, 90, 10), 'spinal-cord', 'nervous', N);
  // cauda equina
  for (let i = -2; i <= 2; i++) {
    add(g, tubeGeometry([
      v3(0, -0.02, 0.014), v3(i * 0.008, -0.06, 0.012), v3(i * 0.012, -0.1, 0.006),
    ], 0.0035, 20, 6), 'spinal-cord', 'nervous', N);
  }

  for (const s of [1, -1]) {
    // brachial plexus -> median nerve
    add(g, tubeGeometry([
      v3(s * 0.02, 0.6, 0.006), v3(s * 0.09, 0.56, 0.002), v3(s * 0.17, 0.53, 0.006),
      v3(s * 0.195, 0.44, 0.014), v3(s * 0.212, 0.31, 0.014), v3(s * 0.226, 0.14, 0.014), v3(s * 0.232, 0.04, 0.014),
    ], 0.007, 60, 8), 'peripheral-nerves', 'nervous', N);
    // ulnar branch
    add(g, tubeGeometry([
      v3(s * 0.19, 0.5, 0.01), v3(s * 0.222, 0.31, -0.006), v3(s * 0.238, 0.14, -0.004), v3(s * 0.242, 0.045, 0.0),
    ], 0.005, 40, 8), 'peripheral-nerves', 'nervous', N);
    // radial branch
    add(g, tubeGeometry([
      v3(s * 0.185, 0.47, -0.012), v3(s * 0.21, 0.32, -0.016), v3(s * 0.222, 0.16, -0.008), v3(s * 0.229, 0.055, 0.006),
    ], 0.005, 40, 8), 'peripheral-nerves', 'nervous', N);
    // intercostal nerves (a few along the ribs)
    for (let i = 0; i < 5; i++) {
      const y = 0.42 - i * 0.06;
      const pts = [];
      for (let k = 0; k <= 6; k++) {
        const a = THREE.MathUtils.lerp(Math.PI / 2, -0.2, k / 6);
        pts.push(v3(s * 0.085 * Math.cos(a), y - 0.02 * (1 - Math.cos(a)), -0.04 + 0.11 * Math.sin(a) + 0.02));
      }
      add(g, tubeGeometry(pts, 0.0028, 20, 6), 'peripheral-nerves', 'nervous', N);
    }
    // lumbar plexus -> sciatic -> tibial
    add(g, tubeGeometry([
      v3(s * 0.02, -0.025, 0.01), v3(s * 0.055, -0.045, -0.02), v3(s * 0.075, -0.17, -0.03),
      v3(s * 0.086, -0.42, -0.028), v3(s * 0.088, -0.62, -0.02), v3(s * 0.088, -0.72, -0.012),
      v3(s * 0.088, -0.83, -0.006),
    ], 0.008, 70, 8), 'peripheral-nerves', 'nervous', N);
    // femoral nerve (anterior)
    add(g, tubeGeometry([
      v3(s * 0.03, -0.025, 0.012), v3(s * 0.06, -0.085, 0.03), v3(s * 0.08, -0.3, 0.03), v3(s * 0.086, -0.5, 0.02),
    ], 0.0055, 40, 8), 'peripheral-nerves', 'nervous', N);
    // sympathetic chain with ganglia
    const chain = [];
    for (let i = 0; i < 18; i++) {
      const u = i / 17;
      const y = THREE.MathUtils.lerp(0.62, -0.1, u);
      const z = THREE.MathUtils.lerp(0.01, -0.05, Math.sin(u * Math.PI)) - 0.008;
      chain.push(v3(s * 0.025, y, z));
    }
    add(g, tubeGeometry(chain, 0.0032, 60, 6), 'autonomic', 'nervous', '#e6c98f');
    for (let i = 0; i < 10; i++) {
      const u = i / 9;
      const y = THREE.MathUtils.lerp(0.6, -0.09, u);
      add(g, blobGeometry(0.0055, 1, 0.1, 8, i), 'autonomic', 'nervous', '#f0d79a', { position: v3(s * 0.025, y, -0.015 - 0.03 * Math.sin(u * Math.PI)) });
    }
    // vagus nerve in the neck
    add(g, tubeGeometry([
      v3(s * 0.018, 0.72, 0.005), v3(s * 0.026, 0.62, 0.02), v3(s * 0.03, 0.5, 0.01), v3(s * 0.022, 0.4, -0.01), v3(s * 0.012, 0.28, -0.015),
    ], 0.004, 40, 6), 'autonomic', 'nervous', '#e6c98f');
  }

  /* ---------------- special senses ---------------- */
  for (const s of [1, -1]) {
    const eye = add(g, ellipsoidGeometry(0.021, 0.021, 0.021, 20), 'eye', 'nervous', EYE, { position: v3(s * 0.032, 0.786, 0.062) });
    add(g, ellipsoidGeometry(0.011, 0.011, 0.008, 16), 'eye', 'nervous', '#8fb8d8', { position: v3(s * 0.032, 0.786, 0.082) });
    add(g, ellipsoidGeometry(0.0055, 0.0055, 0.005, 12), 'eye', 'nervous', '#2b2b2b', { position: v3(s * 0.032, 0.786, 0.086) });
    add(g, tubeGeometry([v3(s * 0.032, 0.786, 0.045), v3(s * 0.02, 0.79, 0.01)], 0.0035, 12, 6), 'eye', 'nervous', '#e8dfc0');
    // pinna
    add(g, new THREE.TorusGeometry(0.019, 0.005, 8, 18, Math.PI * 1.5), 'ear', 'nervous', '#e0a882', {
      position: v3(s * 0.093, 0.782, -0.006), rotation: [0, Math.PI / 2, s * 0.4], scale: [1, 1, 0.6],
    });
    // cochlea hint
    add(g, new THREE.TorusGeometry(0.008, 0.0025, 6, 14, Math.PI * 1.8), 'ear', 'nervous', '#d8c7e8', {
      position: v3(s * 0.085, 0.775, -0.022), rotation: [1.2, 0.3, 0],
    });
  }
  // nose: bridge + tip + olfactory patch
  add(g, tubeGeometry([v3(0, 0.79, 0.075), v3(0, 0.762, 0.092), v3(0, 0.742, 0.088)], 0.01, 16, 8), 'nose', 'nervous', '#e0a882');
  add(g, ellipsoidGeometry(0.012, 0.008, 0.01, 10), 'nose', 'nervous', '#e0c9a0', { position: v3(0, 0.78, 0.055) });
  // tongue
  const tongue = add(g, ellipsoidGeometry(0.03, 0.014, 0.045, 18), 'tongue', 'nervous', '#d4707a', { position: v3(0, 0.735, 0.045) });
  for (let i = 0; i < 8; i++) {
    add(g, blobGeometry(0.004, 0, 0, 4, i), 'tongue', 'nervous', '#e88b93', { position: v3((i % 4 - 1.5) * 0.012, 0.744, 0.03 + Math.floor(i / 4) * 0.018) });
  }

  /* ---------------- histology anchors ---------------- */
  const neuronModel = new THREE.Group();
  neuronModel.name = 'neuron-model';
  neuronModel.visible = false;
  add(neuronModel, blobGeometry(0.026, 2, 0.12, 8, 2), 'neuron', 'nervous', '#d7c78a', { position: v3(0, 0, 0) });
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    add(neuronModel, tubeGeometry([
      v3(0, 0, 0), v3(Math.cos(a) * 0.05, 0.02, Math.sin(a) * 0.05), v3(Math.cos(a) * 0.1, 0.005, Math.sin(a) * 0.1),
    ], 0.004, 16, 6), 'neuron', 'nervous', '#d7c78a');
  }
  add(neuronModel, tubeGeometry([v3(0, -0.02, 0), v3(0.02, -0.08, 0.03), v3(0.01, -0.16, 0.02)], 0.006, 20, 8), 'neuron', 'nervous', '#e2d49b');
  g.add(neuronModel);

  return g;
}

export default buildNervous;

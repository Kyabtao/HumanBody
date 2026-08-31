import * as THREE from 'three';
import { add, blobGeometry, ellipsoidGeometry, tubeGeometry, v3, roundedBoxGeometry, material } from '../helpers.js';

/* ============================ RESPIRATORY ============================ */
export function buildRespiratory() {
  const g = new THREE.Group();
  g.name = 'respiratory';
  const LUNG = '#e2969a';
  const LUNG_D = '#c87b84';

  // lobes: right lung (–X) has three, left lung (+X) two (cardiac notch)
  const right = [
    [v3(-0.082, 0.455, 0.0), [0.048, 0.055, 0.044]],
    [v3(-0.088, 0.392, 0.014), [0.042, 0.036, 0.04]],
    [v3(-0.078, 0.315, 0.0), [0.052, 0.072, 0.046]],
  ];
  const left = [
    [v3(0.09, 0.45, 0.004), [0.046, 0.062, 0.044]],
    [v3(0.084, 0.318, 0.0), [0.05, 0.073, 0.046]],
  ];
  [...right, ...left].forEach(([p, s], i) => {
    const m = add(g, blobGeometry(1, 3, 0.05, 9, i), 'lungs', 'respiratory', i < 3 ? LUNG : LUNG_D, { position: p, scale: s });
  });
  // pleural sacs
  for (const s of [1, -1]) {
    const pleura = new THREE.Mesh(
      ellipsoidGeometry(0.068, 0.115, 0.06, 20),
      material('#dfeef5', { opacity: 0.14, transparent: true, depthWrite: false, side: THREE.DoubleSide, roughness: 0.2 }),
    );
    pleura.position.set(s * 0.085, 0.38, 0.0);
    pleura.userData = { partId: 'pleura', system: 'respiratory', pickable: true, baseMaterial: pleura.material };
    g.add(pleura);
  }

  // trachea with cartilage rings
  const trach = [v3(0, 0.66, 0.032), v3(0, 0.6, 0.028), v3(0, 0.52, 0.018), v3(0, 0.455, 0.006), v3(0, 0.425, -0.006)];
  add(g, tubeGeometry(trach, 0.0115, 40, 10), 'trachea', 'respiratory', '#dcd3c0');
  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    const p = new THREE.Vector3(0, THREE.MathUtils.lerp(0.655, 0.46, t), THREE.MathUtils.lerp(0.031, 0.012, t));
    add(g, new THREE.TorusGeometry(0.012, 0.0022, 6, 14), 'trachea', 'respiratory', '#cfc4ad', { position: p, rotation: [Math.PI / 2 - 0.4 * t, 0, 0] });
  }
  // main bronchi + lobar branches
  for (const s of [1, -1]) {
    const main = [v3(0, 0.425, -0.006), v3(s * 0.028, 0.415, -0.012), v3(s * 0.055, 0.4, -0.012)];
    add(g, tubeGeometry(main, 0.008, 20, 8), 'bronchi', 'respiratory', '#cfc4ad');
    const branches = s < 0
      ? [[v3(-0.075, 0.44, -0.005)], [v3(-0.085, 0.39, 0.005)], [v3(-0.075, 0.32, -0.005)]]
      : [[v3(0.088, 0.44, -0.002)], [v3(0.082, 0.33, -0.005)]];
    branches.forEach(([end]) => {
      add(g, tubeGeometry([v3(s * 0.055, 0.4, -0.012), end], 0.0055, 16, 8), 'bronchi', 'respiratory', '#cfc4ad');
    });
  }
  // larynx + vocal folds
  add(g, roundedBoxGeometry(0.036, 0.036, 0.03, 0.008), 'larynx', 'respiratory', '#d9cdb8', { position: v3(0, 0.668, 0.034) });
  for (const s of [1, -1]) {
    add(g, roundedBoxGeometry(0.014, 0.004, 0.02, 0.002), 'larynx', 'respiratory', '#f0e6d2', { position: v3(s * 0.008, 0.652, 0.032) });
  }
  // pharynx
  add(g, tubeGeometry([v3(0, 0.71, 0.002), v3(0, 0.68, 0.018), v3(0, 0.655, 0.03)], 0.017, 20, 10), 'pharynx', 'respiratory', '#d9a0a0');
  // nasal cavity / turbinates
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      add(g, ellipsoidGeometry(0.012, 0.005, 0.014, 10), 'nasal-cavity', 'respiratory', '#df9a9a', {
        position: v3(s * 0.016, 0.775 - i * 0.012, 0.042 + i * 0.004),
      });
    }
  }

  // histology anchor: alveoli cluster + capillary net
  const alveoli = new THREE.Group();
  alveoli.name = 'alveoli-model';
  alveoli.visible = false;
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const rr = 0.05 + (i % 3) * 0.035;
    add(alveoli, blobGeometry(0.026 + (i % 3) * 0.004, 2, 0.05, 7, i), 'alveoli', 'respiratory', '#f0b8bc', {
      position: v3(Math.cos(a) * rr, Math.sin(a * 1.7) * 0.04, Math.sin(a) * rr),
    });
  }
  add(alveoli, tubeGeometry([v3(-0.12, -0.06, 0), v3(0, -0.075, 0.01), v3(0.12, -0.06, 0)], 0.008, 30, 8), 'bronchi', 'respiratory', '#cfc4ad');
  g.add(alveoli);

  return g;
}

/* ============================= DIGESTIVE ============================== */
export function buildDigestive() {
  const g = new THREE.Group();
  g.name = 'digestive';

  // mouth + teeth
  add(g, ellipsoidGeometry(0.045, 0.03, 0.035, 18), 'mouth', 'digestive', '#c9707a', { position: v3(0, 0.742, 0.055) });
  for (let i = 0; i < 8; i++) {
    const s = i < 4 ? 1 : -1;
    const k = i % 4;
    add(g, roundedBoxGeometry(0.009, 0.011, 0.008, 0.002), 'mouth', 'digestive', '#f6f2e6', { position: v3(s * (0.012 + k * 0.013), 0.75, 0.078) });
    add(g, roundedBoxGeometry(0.009, 0.011, 0.008, 0.002), 'mouth', 'digestive', '#f6f2e6', { position: v3(s * (0.012 + k * 0.013), 0.733, 0.076) });
  }
  // salivary glands
  for (const s of [1, -1]) {
    add(g, blobGeometry(0.018, 2, 0.08, 6, s), 'salivary-glands', 'digestive', '#e8d5a8', { position: v3(s * 0.072, 0.762, 0.005) });
    add(g, blobGeometry(0.014, 2, 0.08, 6, s + 3), 'salivary-glands', 'digestive', '#e8d5a8', { position: v3(s * 0.05, 0.722, 0.042) });
  }
  // oesophagus
  add(g, tubeGeometry([
    v3(0, 0.655, 0.014), v3(0, 0.55, -0.004), v3(0, 0.4, -0.012), v3(0, 0.26, -0.014), v3(0.0, 0.205, -0.008),
  ], 0.011, 60, 10), 'oesophagus', 'digestive', '#d0a184');

  // stomach (J-shaped sac)
  add(g, tubeGeometry([
    v3(0.0, 0.205, -0.005), v3(0.028, 0.19, 0.012), v3(0.055, 0.16, 0.022), v3(0.062, 0.125, 0.026),
    v3(0.045, 0.095, 0.03), v3(0.015, 0.088, 0.028), v3(-0.018, 0.105, 0.022),
  ], 0.026, 60, 12), 'stomach', 'digestive', '#d98a5c');
  add(g, blobGeometry(0.028, 2, 0.06, 7, 2), 'stomach', 'digestive', '#d98a5c', { position: v3(0.04, 0.16, 0.025) });

  // liver: right lobe (large) + left lobe
  const liverR = add(g, blobGeometry(0.075, 3, 0.035, 6, 1.1), 'liver', 'digestive', '#8c4a3c', {
    position: v3(-0.042, 0.16, 0.018), scale: [1, 0.6, 0.85], rotation: [0, 0, 0.12],
  });
  const liverL = add(g, blobGeometry(0.05, 3, 0.035, 6, 4.2), 'liver', 'digestive', '#94513f', {
    position: v3(0.035, 0.148, 0.024), scale: [1, 0.5, 0.8],
  });
  add(g, blobGeometry(0.026, 2, 0.05, 6, 7), 'liver', 'digestive', '#7d4034', { position: v3(0.0, 0.13, 0.03), scale: [1, 0.5, 0.7] });
  // gallbladder
  add(g, ellipsoidGeometry(0.013, 0.022, 0.014, 14), 'gallbladder', 'digestive', '#7fa86a', { position: v3(-0.03, 0.118, 0.052), rotation: [0.3, 0, 0.2] });
  // pancreas (head to tail)
  add(g, tubeGeometry([
    v3(-0.072, 0.115, -0.012), v3(-0.04, 0.108, 0.0), v3(0.0, 0.1, 0.005), v3(0.03, 0.092, 0.0),
  ], 0.013, 30, 10), 'pancreas', 'digestive', '#dcc08a');
  add(g, blobGeometry(0.019, 2, 0.06, 6, 3), 'pancreas', 'digestive', '#dcc08a', { position: v3(-0.072, 0.112, -0.012) });
  // islets of Langerhans (endocrine pancreas)
  for (let i = 0; i < 14; i++) {
    add(g, blobGeometry(0.0045, 1, 0.2, 8, i), 'pancreas-islets', 'endocrine', '#f0d27a', {
      position: v3(-0.067 + i * 0.009, 0.1 + 0.004 * Math.sin(i), 0.002 + 0.004 * Math.cos(i)),
    });
  }

  // small intestine: a controlled coil
  const siPts = [];
  const loops = 4.6;
  for (let i = 0; i <= 120; i++) {
    const t = i / 120;
    const ang = t * Math.PI * 2 * loops;
    const r = 0.055 * (1 - 0.5 * t) + 0.012 * Math.sin(t * 12);
    siPts.push(v3(Math.cos(ang) * r, 0.09 - t * 0.14, 0.02 + Math.sin(ang) * r * 0.62));
  }
  add(g, tubeGeometry(siPts, 0.0165, 400, 10), 'small-intestine', 'digestive', '#e0a172');

  // large intestine: caecum -> ascending -> transverse -> descending -> sigmoid -> rectum
  const liPts = [
    v3(-0.08, -0.012, 0.03), v3(-0.092, 0.025, 0.022), v3(-0.094, 0.07, 0.016), v3(-0.086, 0.11, 0.012),
    v3(-0.06, 0.13, 0.014), v3(0.02, 0.125, 0.042), v3(0.03, 0.13, 0.04), v3(0.07, 0.126, 0.014),
    v3(0.093, 0.095, 0.012), v3(0.094, 0.045, 0.016), v3(0.09, -0.005, 0.024), v3(0.05, -0.03, 0.03),
    v3(0.005, -0.05, 0.02), v3(0.0, -0.1, 0.005), v3(0.0, -0.16, 0.0),
  ];
  add(g, tubeGeometry(liPts, 0.021, 200, 12), 'large-intestine', 'digestive', '#c68a63');
  // appendix
  add(g, tubeGeometry([v3(-0.08, -0.015, 0.03), v3(-0.076, -0.038, 0.04), v3(-0.068, -0.055, 0.03)], 0.006, 16, 8), 'large-intestine', 'digestive', '#c68a63');
  // taeniae / haustra rings
  for (let i = 0; i < 10; i++) {
    const t = i / 9;
    const p = new THREE.Vector3().copy(liPts[1]).lerp(liPts[11], t);
    add(g, new THREE.TorusGeometry(0.022, 0.0035, 6, 12), 'large-intestine', 'digestive', '#b4785a', {
      position: v3(Math.cos(t * 6) * 0.09, p.y * 0.55 + 0.05, 0.02 + Math.sin(t * 6) * 0.02), rotation: [Math.PI / 2, 0, 0],
    });
  }

  // peritoneum: translucent abdominal sac
  const perit = new THREE.Mesh(
    ellipsoidGeometry(0.135, 0.2, 0.105, 20),
    material('#f2dcd0', { opacity: 0.1, transparent: true, depthWrite: false, side: THREE.DoubleSide, roughness: 0.3 }),
  );
  perit.position.set(0, 0.12, 0.01);
  perit.userData = { partId: 'peritoneum', system: 'digestive', pickable: true, baseMaterial: perit.material };
  g.add(perit);

  // microbiome: a friendly cloud of bacteria inside the colon
  for (let i = 0; i < 26; i++) {
    const t = i / 25;
    const a = i * 1.7;
    add(g, ellipsoidGeometry(0.008, 0.004, 0.004, 8), 'gut-microbiome', 'digestive', i % 3 ? '#8fbf6a' : '#6f9fd8', {
      position: v3(0.02 + Math.cos(a) * 0.05, 0.05 - t * 0.06, 0.02 + Math.sin(a) * 0.03), rotation: [0, a, 0.3],
    });
  }

  // histology anchor: intestinal villi
  const villi = new THREE.Group();
  villi.name = 'villi-model';
  villi.visible = false;
  add(villi, roundedBoxGeometry(0.24, 0.02, 0.16, 0.006), 'small-intestine', 'digestive', '#d98a5c', { position: v3(0, -0.02, 0) });
  for (let i = 0; i < 40; i++) {
    const x = (i % 8) * 0.03 - 0.105;
    const z = Math.floor(i / 8) * 0.03 - 0.06;
    add(villi, new THREE.CylinderGeometry(0.007, 0.009, 0.05 + (i % 3) * 0.012, 8), 'small-intestine', 'digestive', '#e8a878', { position: v3(x, 0.015, z) });
  }
  g.add(villi);

  return g;
}

/* ============================== URINARY =============================== */
export function buildUrinary() {
  const g = new THREE.Group();
  g.name = 'urinary';

  for (const s of [1, -1]) {
    const k = add(g, ellipsoidGeometry(0.027, 0.047, 0.024, 18), 'kidney', 'urinary', '#a45a4e', {
      position: v3(s * 0.068, 0.068, -0.042), rotation: [0, s * 0.3, s * 0.12],
    });
    // renal hilum
    add(g, ellipsoidGeometry(0.008, 0.014, 0.012, 10), 'kidney', 'urinary', '#7d4038', { position: v3(s * 0.05, 0.063, -0.03) });
    // ureter
    add(g, tubeGeometry([
      v3(s * 0.05, 0.058, -0.032), v3(s * 0.05, 0.0, -0.028), v3(s * 0.035, -0.035, -0.01),
      v3(s * 0.02, -0.062, 0.005), v3(s * 0.012, -0.078, 0.014),
    ], 0.0055, 50, 8), 'ureter', 'urinary', '#c9a06a');
    // adrenal cap (endocrine)
    add(g, blobGeometry(0.016, 2, 0.08, 6, s), 'adrenal', 'endocrine', '#e0c060', {
      position: v3(s * 0.068, 0.112, -0.042), scale: [1.1, 0.55, 0.8],
    });
    // renal artery stub
    add(g, tubeGeometry([v3(s * 0.012, 0.035, -0.032), v3(s * 0.04, 0.06, -0.04), v3(s * 0.055, 0.068, -0.042)], 0.005, 16, 8), 'kidney', 'urinary', '#c94a4a');
  }
  // bladder
  add(g, blobGeometry(0.038, 3, 0.03, 6, 5), 'bladder', 'urinary', '#d9c98a', { position: v3(0, -0.092, 0.024), scale: [1, 0.85, 0.9] });
  // urethra
  add(g, tubeGeometry([v3(0, -0.118, 0.03), v3(0, -0.138, 0.045), v3(0, -0.152, 0.055)], 0.008, 20, 8), 'urethra', 'urinary', '#c9a06a');

  // histology anchor: a nephron
  const nephron = new THREE.Group();
  nephron.name = 'nephron-model';
  nephron.visible = false;
  add(nephron, blobGeometry(0.045, 2, 0.2, 8, 3), 'nephron', 'urinary', '#d97a6a', { position: v3(-0.06, 0.06, 0) });
  add(nephron, new THREE.TorusGeometry(0.038, 0.012, 8, 20), 'nephron', 'urinary', '#c96a5a', { position: v3(-0.06, 0.06, 0), rotation: [1.4, 0, 0] });
  const loop = [
    v3(-0.02, 0.05, 0), v3(0.02, 0.08, 0.01), v3(0.05, 0.04, 0), v3(0.06, -0.04, 0),
    v3(0.03, -0.08, 0), v3(0.0, -0.02, 0.01), v3(-0.01, 0.03, 0.02),
  ];
  add(nephron, tubeGeometry(loop, 0.011, 80, 8), 'nephron', 'urinary', '#e0a060');
  add(nephron, tubeGeometry([v3(-0.01, 0.03, 0.02), v3(0.0, 0.0, 0.03), v3(0.02, -0.05, 0.02), v3(0.02, -0.12, 0.0)], 0.009, 40, 8), 'nephron', 'urinary', '#d0b070');
  g.add(nephron);

  return g;
}

/* ============================= ENDOCRINE ============================== */
export function buildEndocrine() {
  const g = new THREE.Group();
  g.name = 'endocrine';

  // thyroid: two lobes + isthmus
  for (const s of [1, -1]) {
    add(g, ellipsoidGeometry(0.015, 0.027, 0.014, 14), 'thyroid', 'endocrine', '#d98a8a', { position: v3(s * 0.024, 0.645, 0.028), rotation: [0.1, 0, s * 0.15] });
    for (let i = 0; i < 2; i++) {
      add(g, blobGeometry(0.0045, 1, 0.1, 8, i + s), 'parathyroid', 'endocrine', '#f0e0a0', { position: v3(s * (0.018 + i * 0.008), 0.655 - i * 0.022, 0.012) });
    }
  }
  add(g, roundedBoxGeometry(0.016, 0.008, 0.009, 0.003), 'thyroid', 'endocrine', '#d98a8a', { position: v3(0, 0.645, 0.028) });
  // thymus
  for (const s of [1, -1]) {
    add(g, blobGeometry(0.022, 2, 0.1, 7, s + 2), 'thymus', 'endocrine', '#f0c8a0', { position: v3(s * 0.016, 0.47, 0.03), scale: [1, 1.5, 0.6] });
  }
  return g;
}

/* ============================== LYMPHATIC ============================= */
export function buildLymphatic() {
  const g = new THREE.Group();
  g.name = 'lymphatic';
  const NODE = '#8fbf9a';
  const VESSEL = '#a8d4b4';

  // spleen (left upper quadrant)
  const spleen = add(g, blobGeometry(0.032, 3, 0.06, 6, 3.3), 'spleen', 'lymphatic', '#8f4a5a', {
    position: v3(0.088, 0.185, -0.018), rotation: [0.1, -0.4, 0.5], scale: [1, 1.25, 0.8],
  });

  // lymph node chains
  const chains = [
    [v3(0.05, 0.66, 0.02), 4, [0.012, 0.03]],
    [v3(-0.05, 0.66, 0.02), 4, [0.012, 0.03]],
    [v3(0.16, 0.52, -0.005), 3, [0.03, 0.05]],
    [v3(-0.16, 0.52, -0.005), 3, [0.03, 0.05]],
    [v3(0.02, 0.36, -0.02), 3, [0.03, 0.08]],
    [v3(0.0, 0.05, -0.03), 4, [0.05, 0.1]],
    [v3(0.055, -0.04, 0.035), 3, [0.04, 0.03]],
    [v3(-0.055, -0.04, 0.035), 3, [0.04, 0.03]],
  ];
  chains.forEach(([base, n, [dx, dy]], ci) => {
    for (let i = 0; i < n; i++) {
      const t = n === 1 ? 0.5 : i / (n - 1) - 0.5;
      add(g, blobGeometry(0.009 + (i % 2) * 0.002, 1, 0.12, 8, i + ci), 'lymph-nodes', 'lymphatic', NODE, {
        position: v3(base.x + t * dx * 2, base.y + t * dy * 2, base.z + Math.sin(i) * 0.006),
      });
    }
  });

  // thoracic duct + right lymphatic duct + leg collectors
  add(g, tubeGeometry([
    v3(0.012, 0.005, -0.02), v3(0.02, 0.07, -0.03), v3(0.018, 0.22, -0.036), v3(0.016, 0.36, -0.03),
    v3(0.02, 0.45, -0.012), v3(0.032, 0.53, 0.004), v3(0.038, 0.565, 0.008),
  ], 0.0045, 70, 8), 'lymph-vessels', 'lymphatic', VESSEL);
  add(g, tubeGeometry([v3(-0.02, 0.52, -0.005), v3(-0.03, 0.55, 0.0), v3(-0.035, 0.565, 0.005)], 0.004, 16, 8), 'lymph-vessels', 'lymphatic', VESSEL);
  for (const s of [1, -1]) {
    add(g, tubeGeometry([
      v3(s * 0.086, -0.6, 0.03), v3(s * 0.08, -0.3, 0.03), v3(s * 0.07, -0.02, 0.02), v3(0.012, 0.005, -0.02),
    ], 0.0038, 40, 8), 'lymph-vessels', 'lymphatic', VESSEL);
    add(g, tubeGeometry([
      v3(s * 0.235, 0.05, 0.02), v3(s * 0.19, 0.3, 0.02), v3(s * 0.16, 0.48, 0.005), v3(s * 0.035, 0.55, 0.0),
    ], 0.0038, 40, 8), 'lymph-vessels', 'lymphatic', VESSEL);
  }
  // tonsils
  for (const s of [1, -1]) {
    add(g, blobGeometry(0.014, 2, 0.12, 8, s + 6), 'tonsils', 'lymphatic', '#d9a0a8', { position: v3(s * 0.03, 0.7, 0.026), scale: [0.8, 1.2, 0.7] });
  }
  // bone marrow cores inside the long bones
  for (const s of [1, -1]) {
    add(g, new THREE.CylinderGeometry(0.009, 0.007, 0.2, 8), 'bone-marrow', 'lymphatic', '#a02a2a', {
      position: v3(s * 0.2035, 0.42, 0.003), rotation: [0, 0, s * 0.1],
    });
    add(g, new THREE.CylinderGeometry(0.011, 0.008, 0.26, 8), 'bone-marrow', 'lymphatic', '#a02a2a', {
      position: v3(s * 0.086, -0.23, 0.004), rotation: [0, 0, s * 0.02],
    });
    add(g, new THREE.CylinderGeometry(0.008, 0.006, 0.2, 8), 'bone-marrow', 'lymphatic', '#a02a2a', {
      position: v3(s * 0.086, -0.64, -0.001),
    });
  }

  // histology anchor: immune cells
  const immune = new THREE.Group();
  immune.name = 'immune-model';
  immune.visible = false;
  add(immune, blobGeometry(0.07, 3, 0.25, 7, 2), 'immunity-innate', 'lymphatic', '#9fd0b0', { position: v3(-0.09, 0, 0) });
  add(immune, blobGeometry(0.05, 2, 0.15, 8, 4), 'immunity-adaptive', 'lymphatic', '#8fa8e0', { position: v3(0.06, 0.02, 0.03) });
  add(immune, blobGeometry(0.035, 2, 0.15, 8, 6), 'immunity-adaptive', 'lymphatic', '#a8bff0', { position: v3(0.13, -0.03, -0.02) });
  for (let i = 0; i < 6; i++) {
    add(immune, tubeGeometry([
      v3(0.06, 0.02, 0.03), v3(0.1, 0.06, 0.06), v3(0.16 + i * 0.005, 0.05, 0.02 + i * 0.012),
    ], 0.004, 12, 6), 'immunity-adaptive', 'lymphatic', '#f0e060');
  }
  g.add(immune);

  return g;
}

/* ============================ REPRODUCTIVE ============================ */
export function buildReproductive(variant = 'female') {
  const g = new THREE.Group();
  g.name = 'reproductive';
  g.userData.variant = variant;

  if (variant === 'female') {
    // uterus + cervix + vagina
    add(g, blobGeometry(0.034, 3, 0.05, 7, 2), 'uterus', 'reproductive', '#d98a9a', { position: v3(0, -0.035, -0.004), scale: [1, 1.05, 0.75] });
    add(g, tubeGeometry([v3(0, -0.063, 0.006), v3(0, -0.085, 0.014)], 0.012, 12, 8), 'uterus', 'reproductive', '#c97a8a');
    add(g, tubeGeometry([v3(0, -0.085, 0.014), v3(0, -0.125, 0.026), v3(0, -0.146, 0.04)], 0.014, 16, 8), 'uterus', 'reproductive', '#d06f80');
    for (const s of [1, -1]) {
      // uterine tube with fimbriae
      add(g, tubeGeometry([
        v3(s * 0.012, -0.013, 0.0), v3(s * 0.03, 0.0, -0.008), v3(s * 0.05, 0.006, -0.014), v3(s * 0.062, 0.004, -0.012),
      ], 0.005, 20, 8), 'uterus', 'reproductive', '#e0a0aa');
      for (let i = 0; i < 4; i++) {
        add(g, tubeGeometry([v3(s * 0.062, 0.004, -0.012), v3(s * (0.07 + i * 0.004), 0.011 + i * 0.006, -0.01 + i * 0.004)], 0.002, 8, 6), 'uterus', 'reproductive', '#e8b0b8');
      }
      // ovary
      add(g, ellipsoidGeometry(0.012, 0.019, 0.013, 14), 'gonads', 'reproductive', '#e8c0c8', { position: v3(s * 0.055, -0.008, -0.018), rotation: [0, 0, s * 0.3] });
    }
  } else {
    // testes, epididymis, vas deferens, prostate
    for (const s of [1, -1]) {
      add(g, ellipsoidGeometry(0.016, 0.021, 0.016, 14), 'gonads', 'reproductive', '#e0b0b8', { position: v3(s * 0.028, -0.128, 0.028), rotation: [0.2, 0, s * 0.15] });
      add(g, tubeGeometry([v3(s * 0.036, -0.12, 0.032), v3(s * 0.04, -0.095, 0.026), v3(s * 0.032, -0.085, 0.022)], 0.004, 12, 6), 'sperm-path', 'reproductive', '#c9a0a8');
      add(g, tubeGeometry([
        v3(s * 0.032, -0.085, 0.022), v3(s * 0.035, -0.065, 0.014), v3(s * 0.03, -0.07, -0.003), v3(s * 0.014, -0.09, -0.006),
      ], 0.0045, 24, 6), 'sperm-path', 'reproductive', '#d8b0b8');
    }
    add(g, blobGeometry(0.019, 2, 0.08, 6, 5), 'sperm-path', 'reproductive', '#d0a0a8', { position: v3(0, -0.092, -0.006), scale: [1, 0.8, 1] });
    add(g, tubeGeometry([v3(0, -0.108, 0.012), v3(0, -0.132, 0.032), v3(0, -0.148, 0.05)], 0.013, 16, 8), 'sperm-path', 'reproductive', '#d68a94');
    add(g, blobGeometry(0.022, 2, 0.06, 6, 8), 'sperm-path', 'reproductive', '#d68a94', { position: v3(0, -0.125, 0.016), scale: [1.1, 0.9, 0.9] });
  }

  return g;
}

export default buildRespiratory;

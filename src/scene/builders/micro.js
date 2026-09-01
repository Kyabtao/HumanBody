import * as THREE from 'three';
import { add, blobGeometry, ellipsoidGeometry, tubeGeometry, v3, roundedBoxGeometry, material } from '../helpers.js';

/**
 * The microscopic world. Each sub-model lives in its own named group so the
 * micro view can show exactly one at a time.
 */
export function buildMicro() {
  const root = new THREE.Group();
  root.name = 'micro';
  const model = (id) => {
    const g = new THREE.Group();
    g.name = `micro-${id}`;
    g.visible = false;
    g.userData.modelFor = id;
    root.add(g);
    return g;
  };

  /* ---------------- the cell + its organelles ---------------- */
  {
    const g = model('cell');
    const membrane = new THREE.Mesh(
      blobGeometry(0.5, 4, 0.03, 6, 1),
      material('#9fb4d4', { opacity: 0.22, transparent: true, depthWrite: false, side: THREE.DoubleSide, roughness: 0.25 }),
    );
    membrane.userData = { partId: 'membrane', system: 'micro', pickable: true, baseMaterial: membrane.material };
    g.add(membrane);

    // nucleus + nucleolus + chromatin
    add(g, blobGeometry(0.2, 3, 0.05, 7, 2), 'nucleus', 'micro', '#7b6bb8', { position: v3(-0.06, 0.05, 0.02) });
    add(g, blobGeometry(0.07, 2, 0.1, 9, 4), 'nucleus', 'micro', '#4d3f86', { position: v3(-0.02, 0.09, 0.06) });
    for (let i = 0; i < 5; i++) {
      const a = i * 1.3;
      add(g, tubeGeometry([
        v3(-0.06 + Math.cos(a) * 0.13, 0.05 + Math.sin(a) * 0.1, 0.02 + Math.sin(a * 2) * 0.1),
        v3(-0.06 + Math.cos(a + 1) * 0.15, 0.05 + Math.sin(a + 1) * 0.12, 0.02 + Math.cos(a) * 0.1),
      ], 0.012, 12, 6), 'nucleus', 'micro', '#5b4da0');
    }
    // mitochondria
    const mitoPos = [v3(0.22, 0.14, 0.12), v3(0.28, -0.12, -0.06), v3(-0.28, -0.1, 0.14), v3(0.1, -0.26, -0.12), v3(-0.2, 0.28, -0.12)];
    mitoPos.forEach((p, i) => {
      const m = add(g, blobGeometry(0.075, 2, 0.05, 6, i + 1), 'mitochondria', 'micro', '#d98a4a', { position: p, scale: [1, 0.6, 0.6] });
      m.rotation.set(i * 0.7, i * 1.1, i * 0.4);
      for (let c = 0; c < 3; c++) {
        add(g, new THREE.TorusGeometry(0.045, 0.008, 6, 12), 'mitochondria', 'micro', '#b06a2a', {
          position: p, rotation: [i * 0.7 + Math.PI / 2, i * 1.1, i * 0.4], scale: [1, 0.6, 1],
        });
      }
    });
    // rough ER (ribosome-studded sheets) around the nucleus
    for (let i = 0; i < 4; i++) {
      const a = i * 1.6;
      add(g, new THREE.TorusGeometry(0.26 + i * 0.02, 0.022, 8, 24, Math.PI * 1.3), 'er-golgi', 'micro', '#c8d4e8', {
        position: v3(-0.06, 0.05, 0.02), rotation: [a, a * 0.8, i * 0.5],
      });
    }
    // golgi stack
    for (let i = 0; i < 5; i++) {
      add(g, new THREE.TorusGeometry(0.1 - i * 0.012, 0.014, 6, 18, Math.PI * 1.5), 'er-golgi', 'micro', '#e0c060', {
        position: v3(0.06, -0.2 + i * 0.02, 0.1), rotation: [1.2 + i * 0.1, 0.3, 0],
      });
    }
    // ribosomes + lysosomes + vesicles
    for (let i = 0; i < 26; i++) {
      const a = i * 2.399;
      const r = 0.18 + (i % 5) * 0.06;
      add(g, blobGeometry(0.017, 1, 0.2, 9, i), 'cell', 'micro', '#6a5acd', {
        position: v3(Math.cos(a) * r, Math.sin(a * 1.4) * 0.3, Math.sin(a) * r),
      });
    }
    for (let i = 0; i < 4; i++) {
      add(g, blobGeometry(0.045, 2, 0.12, 8, i + 5), 'cell', 'micro', '#8fbf9a', {
        position: v3(-0.3 + i * 0.2, -0.3 + (i % 2) * 0.16, 0.2 - i * 0.12),
      });
    }
    // cytoskeleton
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      add(g, tubeGeometry([
        v3(0, 0, 0), v3(Math.cos(a) * 0.3, Math.sin(a) * 0.25, Math.sin(a * 2) * 0.2), v3(Math.cos(a) * 0.46, Math.sin(a) * 0.38, Math.sin(a * 2) * 0.3),
      ], 0.006, 12, 6), 'cell', 'micro', '#d8d0c0');
    }
    // centrosome
    for (let i = 0; i < 2; i++) {
      add(g, new THREE.CylinderGeometry(0.03, 0.03, 0.07, 10), 'cell', 'micro', '#e0a0a0', {
        position: v3(0.26 + i * 0.03, 0.26, -0.2), rotation: [0.4, 0, i ? Math.PI / 2 : 0],
      });
    }
  }

  /* ---------------- epithelium ---------------- */
  {
    const g = model('epithelium');
    add(g, roundedBoxGeometry(0.6, 0.05, 0.4, 0.01), 'epithelium', 'micro', '#c8a0d8', { position: v3(0, -0.14, 0) }); // basement membrane
    for (let i = 0; i < 18; i++) {
      const x = (i % 6) * 0.1 - 0.25;
      const z = Math.floor(i / 6) * 0.13 - 0.13;
      add(g, new THREE.CylinderGeometry(0.042, 0.05, 0.16, 12), 'epithelium', 'micro', i % 3 ? '#d8b0e8' : '#c898d8', { position: v3(x, -0.02, z) });
      add(g, blobGeometry(0.03, 1, 0.15, 8, i), 'epithelium', 'micro', '#8f6ab0', { position: v3(x, -0.03, z) });
    }
    // cilia on top
    for (let i = 0; i < 30; i++) {
      const x = (i % 10) * 0.06 - 0.27;
      const z = Math.floor(i / 10) * 0.13 - 0.13;
      add(g, tubeGeometry([v3(x, 0.06, z), v3(x + 0.01, 0.14, z + 0.01)], 0.004, 6, 5), 'epithelium', 'micro', '#f0e0f8');
    }
    // a goblet cell
    add(g, blobGeometry(0.055, 2, 0.1, 8, 3), 'epithelium', 'micro', '#a8e0d0', { position: v3(0.22, -0.02, 0.1) });
  }

  /* ---------------- connective tissue ---------------- */
  {
    const g = model('connective-tissue');
    for (let i = 0; i < 14; i++) {
      const a = i * 0.9;
      add(g, tubeGeometry([
        v3(-0.4, -0.15 + i * 0.022, 0.2 - i * 0.02),
        v3(0, Math.sin(a) * 0.12, Math.cos(a) * 0.12),
        v3(0.4, 0.15 - i * 0.02, -0.2 + i * 0.025),
      ], 0.012, 20, 6), 'connective-tissue', 'micro', i % 3 ? '#f0e4d0' : '#e0c8a8');
    }
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      add(g, blobGeometry(0.06, 2, 0.2, 7, i), 'connective-tissue', 'micro', '#c89870', {
        position: v3(Math.cos(a) * 0.25, Math.sin(a) * 0.14, Math.sin(a * 2) * 0.1), scale: [1.6, 0.6, 0.7],
      });
    }
  }

  /* ---------------- the three muscle tissue types ---------------- */
  {
    const g = model('muscle-tissue-types');
    // skeletal
    for (let i = 0; i < 5; i++) {
      add(g, new THREE.CylinderGeometry(0.05, 0.05, 0.5, 12), 'muscle-tissue-types', 'micro', '#c2503f', {
        position: v3(-0.3, (i % 3) * 0.11 - 0.1, Math.floor(i / 3) * 0.12 - 0.06), rotation: [0, 0, Math.PI / 2],
      });
      for (let k = 0; k < 6; k++) {
        add(g, new THREE.TorusGeometry(0.05, 0.006, 6, 14), 'muscle-tissue-types', 'micro', '#8f3a2c', {
          position: v3(-0.3 + k * 0.08 - 0.2, (i % 3) * 0.11 - 0.1, Math.floor(i / 3) * 0.12 - 0.06), rotation: [0, Math.PI / 2, 0],
        });
      }
    }
    // cardiac: branched with intercalated discs
    for (let i = 0; i < 4; i++) {
      add(g, new THREE.CylinderGeometry(0.042, 0.042, 0.28, 12), 'muscle-tissue-types', 'micro', '#b0405a', {
        position: v3(0.02, i * 0.12 - 0.18, (i % 2) * 0.1 - 0.05), rotation: [0, 0, Math.PI / 2 + 0.1 * (i % 2 ? 1 : -1)],
      });
      add(g, roundedBoxGeometry(0.012, 0.09, 0.09, 0.004), 'muscle-tissue-types', 'micro', '#7a2038', { position: v3(0.16, i * 0.12 - 0.18, (i % 2) * 0.1 - 0.05) });
    }
    // smooth: spindle cells
    for (let i = 0; i < 7; i++) {
      add(g, blobGeometry(0.06, 2, 0.05, 6, i + 2), 'muscle-tissue-types', 'micro', '#d0a05a', {
        position: v3(0.3 + (i % 2) * 0.06, i * 0.055 - 0.18, (i % 3) * 0.08 - 0.08), scale: [2.2, 0.55, 0.6], rotation: [0, 0, 0.2 * (i % 3 - 1)],
      });
    }
  }

  /* ---------------- nervous tissue ---------------- */
  {
    const g = model('nervous-tissue');
    add(g, blobGeometry(0.13, 3, 0.15, 8, 2), 'nervous-tissue', 'micro', '#d7c78a', { position: v3(-0.15, 0.02, 0) });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      add(g, tubeGeometry([
        v3(-0.15, 0.02, 0),
        v3(-0.15 + Math.cos(a) * 0.2, 0.02 + Math.sin(a) * 0.12, Math.sin(a) * 0.16),
        v3(-0.15 + Math.cos(a) * 0.42, 0.02 + Math.sin(a) * 0.2, Math.sin(a) * 0.3),
      ], 0.012, 16, 6), 'nervous-tissue', 'micro', '#d7c78a');
    }
    add(g, tubeGeometry([v3(-0.15, -0.08, 0), v3(0.05, -0.22, 0.05), v3(0.3, -0.24, 0.02), v3(0.55, -0.2, -0.02)], 0.022, 30, 8), 'nervous-tissue', 'micro', '#e2d49b');
    // myelin sheath
    for (let i = 0; i < 5; i++) {
      const t = i / 4;
      add(g, ellipsoidGeometry(0.03, 0.035, 0.035, 14), 'nervous-tissue', 'micro', '#f0e8d0', {
        position: v3(0.05 + t * 0.5, -0.22 + t * 0.04 - t * t * 0.05, 0.05 - t * 0.07), rotation: [0, 0, 0.1],
      });
    }
    // astrocytes and microglia
    for (let i = 0; i < 4; i++) {
      const a = i * 1.5;
      add(g, blobGeometry(0.07, 2, 0.4, 8, i + 3), 'nervous-tissue', 'micro', i % 2 ? '#9fd0b0' : '#b0c8e8', {
        position: v3(0.1 + Math.cos(a) * 0.25, 0.22 + Math.sin(a) * 0.1, Math.sin(a) * 0.22),
      });
    }
  }

  /* ---------------- stem cells ---------------- */
  {
    const g = model('stem-cells');
    add(g, blobGeometry(0.2, 3, 0.05, 7, 1), 'stem-cells', 'micro', '#8fd0c0', { position: v3(-0.28, 0, 0) });
    add(g, blobGeometry(0.15, 3, 0.05, 7, 2), 'stem-cells', 'micro', '#8fd0c0', { position: v3(0.05, 0.02, 0.04) });
    add(g, blobGeometry(0.15, 3, 0.05, 7, 3), 'stem-cells', 'micro', '#8fd0c0', { position: v3(0.12, -0.06, -0.06) });
    // differentiation arrows into specialised cells
    const targets = [
      [v3(0.45, 0.22, 0), '#c2503f'],
      [v3(0.5, 0.0, 0.05), '#d7c78a'],
      [v3(0.45, -0.22, -0.05), '#e2969a'],
    ];
    targets.forEach(([p, c], i) => {
      add(g, tubeGeometry([v3(0.2, 0, 0), v3(0.3, (i - 1) * 0.1, 0), p.clone().multiplyScalar(0.85)], 0.01, 16, 6), 'stem-cells', 'micro', '#c0c0c0');
      add(g, blobGeometry(0.11, 2, 0.1, 7, i + 4), 'stem-cells', 'micro', c, { position: p });
    });
  }

  /* ---------------- molecular: DNA, transcription, translation ---------------- */
  {
    const g = model('molecular');
    const helix = (offset, color) => {
      const pts = [];
      for (let i = 0; i <= 60; i++) {
        const t = i / 60;
        const ang = t * Math.PI * 4;
        pts.push(v3(-0.45 + t * 0.9, Math.sin(ang) * 0.16 + offset, Math.cos(ang) * 0.16));
      }
      add(g, tubeGeometry(pts, 0.022, 120, 8), 'molecular', 'micro', color);
      return pts;
    };
    const a = helix(0.0, '#5b8fd8');
    const b = helix(0.0, '#d85b8f');
    for (let i = 0; i < 16; i++) {
      const p1 = a[Math.floor((i / 16) * 60)];
      const p2 = v3(p1.x, -p1.y * 0 + (i % 2 ? 0.06 : -0.06), -p1.z);
      add(g, tubeGeometry([p1, p2], 0.008, 4, 5), 'molecular', 'micro', i % 3 ? '#f0d060' : '#f0a060');
    }
    // mRNA leaving + ribosome reading it
    add(g, tubeGeometry([v3(0.1, 0.16, 0.1), v3(0.3, 0.3, 0.2), v3(0.5, 0.26, 0.28)], 0.012, 20, 6), 'molecular', 'micro', '#f0e060');
    add(g, blobGeometry(0.07, 2, 0.1, 7, 5), 'molecular', 'micro', '#9fd0b0', { position: v3(0.36, 0.28, 0.24) });
    add(g, tubeGeometry([v3(0.42, 0.28, 0.24), v3(0.58, 0.36, 0.34)], 0.016, 10, 6), 'molecular', 'micro', '#c2503f');
  }

  /* ---------------- hormones: lock and key ---------------- */
  {
    const g = model('hormones');
    // receptor in a membrane
    add(g, roundedBoxGeometry(0.7, 0.06, 0.36, 0.02), 'hormones', 'micro', '#c8a882', { position: v3(0, -0.2, 0) });
    const rec = add(g, blobGeometry(0.14, 2, 0.1, 7, 2), 'hormones', 'micro', '#8fb8e0', { position: v3(0, -0.14, 0) });
    add(g, blobGeometry(0.06, 2, 0.2, 8, 3), 'hormones', 'micro', '#5b8fd8', { position: v3(-0.02, -0.05, 0) });
    // hormone molecule docking
    add(g, blobGeometry(0.09, 2, 0.25, 8, 4), 'hormones', 'micro', '#f0c060', { position: v3(-0.02, 0.22, 0.02) });
    for (let i = 0; i < 5; i++) {
      add(g, tubeGeometry([v3(-0.02, 0.22, 0.02), v3(0.1 + i * 0.02, 0.34 + (i % 2) * 0.04, 0.06)], 0.012, 6, 5), 'hormones', 'micro', '#f0a060');
    }
    // second messenger cascade inside the cell
    for (let i = 0; i < 6; i++) {
      add(g, blobGeometry(0.035, 1, 0.2, 8, i), 'hormones', 'micro', '#f0e060', { position: v3(-0.1 + i * 0.06, -0.34 - (i % 2) * 0.06, 0.02) });
    }
  }

  /* ---------------- capillary network ---------------- */
  {
    const g = model('capillaries');
    const trunk = [v3(-0.5, 0.1, 0), v3(-0.2, 0.05, 0.02), v3(0.05, 0.0, 0), v3(0.3, -0.05, -0.02), v3(0.55, -0.08, 0)];
    add(g, tubeGeometry(trunk, 0.05, 60, 10), 'capillaries', 'micro', '#d05050');
    for (let i = 0; i < 10; i++) {
      const t = (i + 0.5) / 10;
      const base = new THREE.Vector3().lerpVectors(trunk[1], trunk[3], t);
      const s = i % 2 ? 1 : -1;
      add(g, tubeGeometry([
        base, base.clone().add(v3(0, s * 0.1, s * 0.06)), base.clone().add(v3(0.1, s * 0.18, s * 0.1)), base.clone().add(v3(0.2, s * 0.12, s * 0.04)),
      ], 0.022, 24, 8), 'capillaries', 'micro', '#e07070');
    }
    // red blood cells squeezing through
    for (let i = 0; i < 6; i++) {
      const t = (i + 0.5) / 6;
      const p = new THREE.Vector3().lerpVectors(trunk[0], trunk[4], t);
      add(g, ellipsoidGeometry(0.035, 0.016, 0.035, 14), 'red-blood-cell', 'micro', '#c8352f', { position: p, rotation: [0.2, i, 0.1] });
    }
  }

  /* ---------------- homeostasis: a feedback loop ---------------- */
  {
    const g = model('homeostasis');
    const blocks = [
      [v3(-0.35, 0.12, 0), 'sensor', '#8fd0c0'],
      [v3(0, 0.3, 0), 'control centre', '#8fb8e0'],
      [v3(0.35, 0.12, 0), 'effector', '#f0c060'],
      [v3(0, -0.2, 0), 'variable (e.g. 37 °C)', '#e2969a'],
    ];
    blocks.forEach(([p, , c]) => {
      add(g, roundedBoxGeometry(0.3, 0.16, 0.16, 0.03), 'homeostasis', 'micro', c, { position: p });
    });
    const arrows = [
      [v3(-0.35, 0.2, 0), v3(-0.12, 0.28, 0)],
      [v3(0.12, 0.28, 0), v3(0.35, 0.2, 0)],
      [v3(0.35, 0.04, 0), v3(0.15, -0.16, 0)],
      [v3(-0.15, -0.16, 0), v3(-0.3, 0.04, 0)],
    ];
    arrows.forEach(([a, b]) => {
      add(g, tubeGeometry([a, b], 0.012, 8, 6), 'homeostasis', 'micro', '#e0e0e0');
    });
  }

  /* ---------------- ageing: telomere shortening ---------------- */
  {
    const g = model('aging');
    for (let c = 0; c < 2; c++) {
      const y = c ? -0.22 : 0.16;
      const long = c === 0;
      add(g, tubeGeometry([
        v3(-0.4, y + Math.sin(0) * 0.06, 0), v3(-0.2, y + 0.05, 0.04), v3(0, y - 0.03, 0), v3(0.2, y + 0.05, -0.04), v3(0.4, y, 0),
      ], 0.035, 60, 10), 'aging', 'micro', long ? '#8fb8e0' : '#c88a8a');
      const n = long ? 8 : 4;
      for (let i = 0; i < n; i++) {
        const t = i / (n - 1);
        const x = -0.4 + t * 0.8;
        add(g, new THREE.TorusGeometry(0.04, 0.012, 6, 12), 'aging', 'micro', '#f0d060', { position: v3(x, y + Math.sin(t * Math.PI * 2) * 0.05, 0), rotation: [0, Math.PI / 2, 0] });
      }
    }
    add(g, blobGeometry(0.06, 2, 0.15, 8, 3), 'aging', 'micro', '#9fd0b0', { position: v3(0, -0.02, 0.16) });
  }

  /* ---------------- placenta ---------------- */
  {
    const g = model('placenta');
    // maternal side: cotyledons
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      add(g, blobGeometry(0.13, 2, 0.08, 6, i), 'placenta', 'micro', '#b04a5a', {
        position: v3(Math.cos(a) * 0.14, -0.02, Math.sin(a) * 0.14), scale: [1, 0.45, 1],
      });
    }
    add(g, ellipsoidGeometry(0.3, 0.05, 0.3, 32), 'placenta', 'micro', '#c05a68', { position: v3(0, -0.02, 0) });
    // chorionic villi on the fetal side
    for (let i = 0; i < 26; i++) {
      const a = i * 2.399;
      const r = 0.06 + (i % 6) * 0.038;
      add(g, tubeGeometry([
        v3(Math.cos(a) * r, 0.02, Math.sin(a) * r),
        v3(Math.cos(a) * r * 1.05, 0.1 + (i % 3) * 0.04, Math.sin(a) * r * 1.05),
      ], 0.012, 8, 6), 'placenta', 'micro', '#e09098');
    }
    // umbilical cord with its two arteries and one vein
    add(g, tubeGeometry([v3(0, 0.06, 0), v3(0.1, 0.22, 0.05), v3(0.16, 0.42, 0.02)], 0.05, 20, 10), 'placenta', 'micro', '#e0c8d0');
    add(g, tubeGeometry([v3(0.005, 0.07, 0.01), v3(0.105, 0.23, 0.06), v3(0.165, 0.42, 0.03)], 0.012, 20, 6), 'placenta', 'micro', '#c8352f');
    add(g, tubeGeometry([v3(-0.005, 0.07, -0.01), v3(0.095, 0.22, 0.04), v3(0.155, 0.42, 0.01)], 0.012, 20, 6), 'placenta', 'micro', '#c8352f');
    add(g, tubeGeometry([v3(0, 0.07, 0.02), v3(0.1, 0.21, 0.07), v3(0.16, 0.41, 0.04)], 0.014, 20, 6), 'placenta', 'micro', '#5a76b8');
  }

  /* ---------------- reflex arc ---------------- */
  {
    const g = model('reflex');
    // receptor in the skin
    add(g, roundedBoxGeometry(0.34, 0.06, 0.26, 0.02), 'reflex', 'micro', '#e0a882', { position: v3(-0.42, 0.24, 0) });
    add(g, blobGeometry(0.05, 2, 0.15, 8, 2), 'reflex', 'micro', '#f0a3c0', { position: v3(-0.42, 0.3, 0.06) });
    // sensory neuron
    add(g, tubeGeometry([v3(-0.42, 0.3, 0.06), v3(-0.3, 0.34, 0.05), v3(-0.05, 0.26, 0.02)], 0.022, 20, 8), 'reflex', 'micro', '#6fa8dc');
    add(g, blobGeometry(0.06, 2, 0.15, 8, 5), 'reflex', 'micro', '#6fa8dc', { position: v3(-0.34, 0.05, 0.02) });
    // spinal cord cross-section with the synapse
    add(g, ellipsoidGeometry(0.16, 0.16, 0.1, 24), 'reflex', 'micro', '#d7c78a', { position: v3(0.05, 0.18, 0) });
    add(g, ellipsoidGeometry(0.09, 0.09, 0.06, 18), 'reflex', 'micro', '#b8a870', { position: v3(0.05, 0.18, 0) });
    add(g, blobGeometry(0.04, 1, 0.2, 8, 3), 'reflex', 'micro', '#ffd166', { position: v3(0.0, 0.18, 0.05) });
    // motor neuron
    add(g, tubeGeometry([v3(0.06, 0.12, 0), v3(0.28, 0.02, -0.02), v3(0.44, -0.12, -0.04)], 0.022, 20, 8), 'reflex', 'micro', '#e06666');
    // effector muscle
    add(g, new THREE.CylinderGeometry(0.09, 0.09, 0.34, 16), 'reflex', 'micro', '#c2503f', { position: v3(0.5, -0.22, -0.05), rotation: [0.4, 0, Math.PI / 2] });
    for (let i = 0; i < 4; i++) {
      add(g, new THREE.TorusGeometry(0.09, 0.012, 6, 16), 'reflex', 'micro', '#8f3a2c', {
        position: v3(0.42 + i * 0.06, -0.19 - i * 0.02, -0.05), rotation: [0.4, 0, Math.PI / 2],
      });
    }
  }

  return root;
}

export default buildMicro;

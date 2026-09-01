import * as THREE from 'three';
import { LM, SPINE_PATH, add, boneGeometry, blobGeometry, ellipsoidGeometry, tubeGeometry, v3, arcGeometry, roundedBoxGeometry } from '../helpers.js';

const BONE = '#e9e6dc';
const BONE_DARK = '#cfcabc';
const CART = '#cfe3e6';

const spine = new THREE.CatmullRomCurve3(SPINE_PATH, false, 'catmullrom', 0.4);
const spineAt = (u) => spine.getPointAt(THREE.MathUtils.clamp(u, 0, 1));

export function buildSkeletal() {
  const g = new THREE.Group();
  g.name = 'skeletal';

  /* ---------------- skull & mandible ---------------- */
  const skull = add(g, ellipsoidGeometry(0.093, 0.115, 0.1, 28), 'skull', 'skeletal', BONE, {
    position: v3(0, 0.795, -0.005),
  });
  // scaled to stay just inside the skin: the head loft is 0.088 wide at its widest
  skull.geometry.scale(0.955, 1.05, 1.0);
  // face / maxilla block
  add(g, ellipsoidGeometry(0.062, 0.055, 0.062, 20), 'skull', 'skeletal', BONE, {
    position: v3(0, 0.742, 0.045),
  });
  // eye sockets as shallow dents are skipped; orbits suggested by ridge
  add(g, tubeGeometry(
    [
      v3(-0.055, 0.775, 0.075), v3(-0.03, 0.79, 0.088), v3(0, 0.792, 0.09),
      v3(0.03, 0.79, 0.088), v3(0.055, 0.775, 0.075),
    ], 0.011, 24, 8), 'skull', 'skeletal', BONE, {});

  // mandible: U-shaped arc + two rami
  add(g, arcGeometry(0.055, 0.011, Math.PI * 0.95, 24, 8), 'mandible', 'skeletal', BONE, {
    position: v3(0, 0.715, 0.02),
    rotation: [-Math.PI / 2 + 0.35, 0, Math.PI * 0.025],
    scale: [1.05, 0.85, 1],
  });
  for (const s of [1, -1]) {
    add(g, boneGeometry(v3(s * 0.05, 0.712, 0.012), v3(s * 0.056, 0.775, -0.02), 0.011, 0.012), 'mandible', 'skeletal', BONE);
  }

  /* ---------------- vertebral column ---------------- */
  const seg = (u0, u1, count, key, radius) => {
    for (let i = 0; i < count; i++) {
      const u = THREE.MathUtils.lerp(u0, u1, count === 1 ? 0.5 : i / (count - 1));
      const p = spineAt(u);
      const p2 = spineAt(Math.min(1, u + 0.012));
      const dir = new THREE.Vector3().subVectors(p2, p).normalize();
      const body = add(g, ellipsoidGeometry(radius, radius * 0.42, radius * 0.9, 14), key, 'skeletal', BONE, { position: p });
      body.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      // spinous process pointing backwards
      add(g, boneGeometry(p.clone().add(v3(0, 0, -radius * 0.4)), p.clone().add(v3(0, -0.012, -radius * 1.8)), 0.006, 0.004), key, 'skeletal', BONE);
    }
  };
  seg(0.05, 0.3, 7, 'cervical-vertebrae', 0.019);
  seg(0.33, 0.72, 12, 'thoracic-vertebrae', 0.024);
  seg(0.755, 0.87, 5, 'lumbar-vertebrae', 0.031);
  // intervertebral discs (cartilage)
  for (let i = 0; i < 23; i++) {
    const u = THREE.MathUtils.lerp(0.09, 0.87, i / 22);
    const p = spineAt(u);
    add(g, ellipsoidGeometry(0.022, 0.006, 0.02, 12), 'cartilage', 'skeletal', CART, { position: p.clone().add(v3(0, 0.008, 0.002)) });
  }
  // sacrum + coccyx
  add(g, ellipsoidGeometry(0.055, 0.075, 0.03, 16), 'sacrum', 'skeletal', BONE, {
    position: v3(0, -0.075, -0.048), rotation: [0.35, 0, 0],
  });
  add(g, boneGeometry(v3(0, -0.132, -0.058), v3(0, -0.168, -0.066), 0.012, 0.005), 'sacrum', 'skeletal', BONE);

  /* ---------------- rib cage ---------------- */
  for (let i = 0; i < 12; i++) {
    const t = i / 11;
    const u = THREE.MathUtils.lerp(0.33, 0.7, t);
    const anchor = spineAt(u);
    const rx = 0.05 + 0.082 * Math.sin(Math.PI * Math.min(1, 0.17 + t * 0.9)) * (1 - 0.22 * t);
    const zvAnchor = anchor.z;
    const zf = 0.085 - 0.02 * t;
    const drop = 0.055 + 0.03 * t;
    const endA = i >= 10 ? -0.15 : -1.25; // floating ribs stop short
    for (const s of [1, -1]) {
      const pts = [];
      const steps = 16;
      for (let k = 0; k <= steps; k++) {
        const a = THREE.MathUtils.lerp(Math.PI / 2, endA, k / steps);
        const y = anchor.y - drop * (1 - Math.cos(a)) * 0.62;
        pts.push(v3(
          s * rx * Math.cos(a),
          y,
          (zvAnchor + zf) / 2 + ((zvAnchor - zf) / 2) * Math.sin(a),
        ));
      }
      add(g, tubeGeometry(pts, 0.0075, 40, 7), 'ribs', 'skeletal', BONE);
      // costal cartilage to the sternum for the upper ribs
      if (i < 7) {
        const last = pts[pts.length - 1];
        add(g, tubeGeometry([last, v3(s * 0.022, last.y - 0.012, zf * 0.92), v3(0, last.y - 0.02, 0.082 - 0.006 * i)], 0.007, 16, 7), 'cartilage', 'skeletal', CART);
      }
    }
  }
  // sternum: manubrium, body, xiphoid
  add(g, roundedBoxGeometry(0.05, 0.055, 0.016, 0.008), 'sternum', 'skeletal', BONE, { position: v3(0, 0.475, 0.088), rotation: [0.15, 0, 0] });
  add(g, roundedBoxGeometry(0.042, 0.13, 0.014, 0.007), 'sternum', 'skeletal', BONE, { position: v3(0, 0.385, 0.092), rotation: [0.12, 0, 0] });
  add(g, ellipsoidGeometry(0.014, 0.03, 0.008, 10), 'sternum', 'skeletal', CART, { position: v3(0, 0.305, 0.086), rotation: [0.1, 0, 0] });

  /* ---------------- shoulder girdle ---------------- */
  for (const s of [1, -1]) {
    add(g, tubeGeometry([v3(s * 0.012, 0.575, 0.062), v3(s * 0.09, 0.583, 0.05), v3(s * 0.17, 0.566, 0.025)], 0.009, 24, 8), 'clavicle', 'skeletal', BONE);
    add(g, ellipsoidGeometry(0.055, 0.075, 0.012, 16), 'scapula', 'skeletal', BONE, {
      position: v3(s * 0.115, 0.45, -0.068), rotation: [0.12, s * 0.35, s * -0.12],
    });
    // scapular spine / acromion
    add(g, boneGeometry(v3(s * 0.055, 0.5, -0.06), v3(s * 0.175, 0.552, 0.005), 0.008, 0.006), 'scapula', 'skeletal', BONE);
    // glenoid
    add(g, ellipsoidGeometry(0.022, 0.022, 0.012, 12), 'joints', 'skeletal', CART, { position: v3(s * 0.175, 0.5, -0.005), rotation: [0, 0, 0] });
  }

  /* ---------------- upper limb ---------------- */
  for (const s of [1, -1]) {
    const sh = v3(s * 0.185, 0.545, 0);
    const el = v3(s * 0.222, 0.292, 0.005);
    const wr = v3(s * 0.233, 0.048, 0.012);
    add(g, boneGeometry(sh, el, 0.019, 0.014, 12), 'humerus', 'skeletal', BONE);
    add(g, blobGeometry(0.021, 2, 0.05, 6, 2), 'humerus', 'skeletal', BONE, { position: sh.clone().add(v3(s * 0.004, 0.022, 0)) });
    // humeral condyles
    add(g, ellipsoidGeometry(0.02, 0.014, 0.019, 12), 'humerus', 'skeletal', BONE, { position: el.clone().add(v3(0, 0.012, 0)) });
    // radius (thumb side) and ulna
    add(g, boneGeometry(v3(s * 0.215, 0.282, 0.014), v3(s * 0.222, 0.05, 0.018), 0.0105, 0.013, 10), 'radius', 'skeletal', BONE);
    add(g, boneGeometry(v3(s * 0.232, 0.284, -0.004), v3(s * 0.241, 0.05, -0.002), 0.0125, 0.008, 10), 'ulna', 'skeletal', BONE);
    add(g, ellipsoidGeometry(0.013, 0.016, 0.013, 10), 'ulna', 'skeletal', BONE, { position: v3(s * 0.232, 0.298, -0.008) });
    // carpals (two rows) + metacarpals + phalanges
    for (let c = 0; c < 8; c++) {
      const row = c < 4 ? 0 : 1;
      const idx = c % 4;
      const p = v3(s * (0.216 + idx * 0.013), 0.032 - row * 0.016, 0.006 - row * 0.004);
      add(g, blobGeometry(0.0085, 1, 0.1, 7, c), 'hand-bones', 'skeletal', BONE, { position: p });
    }
    for (let f = 0; f < 5; f++) {
      const off = (f - 2) * 0.011;
      const base = v3(s * (0.222 + Math.abs(f - 2) * 0.002), 0.008, 0.006 + off * 0.9);
      const mcp = v3(s * (0.228 + f * 0.001), -0.028, 0.008 + off);
      add(g, boneGeometry(base, mcp, 0.0055, 0.0048, 8), 'hand-bones', 'skeletal', BONE);
      let tip = mcp;
      const joints = f === 0 ? 2 : 3;
      for (let j = 0; j < joints; j++) {
        const len = f === 0 ? 0.026 : 0.03 - j * 0.008;
        const next = v3(tip.x + s * 0.001, tip.y - len, tip.z + (f === 0 ? s * 0.008 : 0.001));
        add(g, boneGeometry(tip, next, 0.0048, 0.0038, 8), 'hand-bones', 'skeletal', BONE);
        tip = next;
      }
    }
  }

  /* ---------------- pelvis ---------------- */
  for (const s of [1, -1]) {
    const wing = add(g, ellipsoidGeometry(0.047, 0.08, 0.036, 18), 'pelvis', 'skeletal', BONE, {
      position: v3(s * 0.058, 0.012, -0.012), rotation: [0.12, s * -0.45, s * 0.5],
    });
    wing.geometry.scale(1, 1, 0.55);
    // acetabulum
    add(g, ellipsoidGeometry(0.026, 0.026, 0.02, 14), 'joints', 'skeletal', CART, { position: v3(s * 0.076, -0.018, 0.005) });
    // ischium / pubis rims
    add(g, tubeGeometry([
      v3(s * 0.072, -0.032, -0.01), v3(s * 0.058, -0.075, 0.012), v3(s * 0.028, -0.085, 0.028), v3(s * 0.008, -0.082, 0.032),
    ], 0.011, 24, 8), 'pelvis', 'skeletal', BONE);
  }
  add(g, roundedBoxGeometry(0.022, 0.026, 0.02, 0.008), 'cartilage', 'skeletal', CART, { position: v3(0, -0.084, 0.032) });

  /* ---------------- lower limb ---------------- */
  for (const s of [1, -1]) {
    const hip = v3(s * 0.076, -0.018, 0.002);
    const knee = v3(s * 0.09, -0.44, 0.006);
    const ankle = v3(s * 0.086, -0.828, -0.004);
    add(g, boneGeometry(v3(s * 0.064, -0.008, 0), hip, 0.017, 0.016, 10), 'femur', 'skeletal', BONE); // femoral neck
    add(g, boneGeometry(hip, knee, 0.023, 0.019, 12), 'femur', 'skeletal', BONE);
    add(g, blobGeometry(0.022, 2, 0.05, 6, 3), 'femur', 'skeletal', BONE, { position: hip });
    add(g, ellipsoidGeometry(0.028, 0.024, 0.028, 14), 'femur', 'skeletal', BONE, { position: knee.clone().add(v3(0, 0.01, 0)) });
    add(g, blobGeometry(0.02, 2, 0.08, 8, 5), 'patella', 'skeletal', BONE, {
      position: v3(s * 0.09, -0.432, 0.048), scale: [1, 1.15, 0.55],
    });
    add(g, boneGeometry(v3(s * 0.078, -0.452, 0.004), v3(s * 0.084, -0.822, -0.004), 0.019, 0.014, 12), 'tibia', 'skeletal', BONE);
    add(g, boneGeometry(v3(s * 0.106, -0.458, -0.002), v3(s * 0.1, -0.822, -0.006), 0.008, 0.007, 10), 'fibula', 'skeletal', BONE);
    // malleoli
    add(g, ellipsoidGeometry(0.014, 0.02, 0.014, 10), 'tibia', 'skeletal', BONE, { position: v3(s * 0.082, -0.845, 0.004) });
    add(g, ellipsoidGeometry(0.012, 0.018, 0.012, 10), 'fibula', 'skeletal', BONE, { position: v3(s * 0.102, -0.845, -0.004) });
    // foot: tarsals, metatarsals, phalanges
    add(g, blobGeometry(0.026, 2, 0.09, 6, 9), 'foot-bones', 'skeletal', BONE, { position: v3(s * 0.086, -0.868, -0.022), scale: [1, 0.9, 1.3] });
    add(g, blobGeometry(0.019, 2, 0.08, 6, 4), 'foot-bones', 'skeletal', BONE, { position: v3(s * 0.086, -0.845, 0.03) });
    for (let m = 0; m < 5; m++) {
      const z = 0.055 + m * 0.017;
      const base = v3(s * 0.086, -0.865, z);
      const head = v3(s * 0.086, -0.878, z + 0.032 - Math.abs(m - 2) * 0.005);
      add(g, boneGeometry(base, head, 0.006, 0.005, 8), 'foot-bones', 'skeletal', BONE);
      if (m > 0 || true) {
        const joints = m === 4 ? 2 : 3;
        let tip = head;
        for (let j = 0; j < joints; j++) {
          const len = 0.013 - j * 0.003;
          const next = v3(tip.x, tip.y - 0.002, tip.z + len);
          add(g, boneGeometry(tip, next, 0.0045, 0.0035, 6), 'foot-bones', 'skeletal', BONE);
          tip = next;
        }
      }
    }
  }

  /* ---------------- joint capsules: knees, elbows, shoulders ---------------- */
  for (const s of [1, -1]) {
    add(g, ellipsoidGeometry(0.032, 0.022, 0.03, 14), 'joints', 'skeletal', CART, { position: v3(s * 0.09, -0.455, 0.004), scale: [1, 0.8, 1] });
    add(g, ellipsoidGeometry(0.024, 0.02, 0.024, 14), 'joints', 'skeletal', CART, { position: v3(s * 0.226, 0.3, 0.002) });
    add(g, ellipsoidGeometry(0.026, 0.026, 0.026, 14), 'joints', 'skeletal', CART, { position: v3(s * 0.088, -0.83, -0.004), scale: [1.2, 0.8, 1] });
  }

  /* ---------------- bone tissue sample plate (histology anchor) ---------- */
  const sample = new THREE.Group();
  add(sample, roundedBoxGeometry(0.06, 0.06, 0.012, 0.004), 'bone-tissue', 'skeletal', BONE_DARK, { position: v3(0, 0, 0) });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    add(sample, new THREE.CylinderGeometry(0.004, 0.004, 0.014, 8), 'bone-tissue', 'skeletal', '#8d8577', {
      position: v3(Math.cos(a) * 0.018, Math.sin(a) * 0.018, 0), rotation: [Math.PI / 2, 0, 0],
    });
  }
  sample.position.set(0, 0.001, 0);
  sample.visible = false;
  sample.name = 'histology-bone';
  g.add(sample);

  return g;
}

export default buildSkeletal;

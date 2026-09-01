import * as THREE from 'three';
import { add, limbGeometry, ellipsoidGeometry, blobGeometry, tubeGeometry, v3, roundedBoxGeometry } from '../helpers.js';

const M = '#c2503f';
const M_DARK = '#9e3d2f';
const TENDON = '#e8e0cf';

export function buildMuscular() {
  const g = new THREE.Group();
  g.name = 'muscular';

  // trunk
  for (const s of [1, -1]) {
    const pec = add(g, ellipsoidGeometry(0.082, 0.05, 0.045, 20), 'pectoralis', 'muscular', M, {
      position: v3(s * 0.072, 0.44, 0.068), rotation: [0.25, s * -0.3, s * -0.25],
    });
    pec.geometry.scale(1, 1, 0.7);

    const lat = add(g, ellipsoidGeometry(0.055, 0.13, 0.055, 18), 'latissimus-dorsi', 'muscular', M_DARK, {
      position: v3(s * 0.095, 0.33, -0.045), rotation: [0.1, s * 0.25, s * 0.15],
    });
    lat.geometry.scale(1, 1, 0.5);

    const delt = add(g, ellipsoidGeometry(0.052, 0.065, 0.055, 18), 'deltoid', 'muscular', M, {
      position: v3(s * 0.182, 0.52, 0.0),
    });

    // upper arm
    add(g, limbGeometry(v3(s * 0.19, 0.5, 0.018), v3(s * 0.216, 0.31, 0.016), 0.033, 0.028, 1.25, 16), 'biceps', 'muscular', M);
    add(g, limbGeometry(v3(s * 0.196, 0.5, -0.022), v3(s * 0.224, 0.31, -0.018), 0.032, 0.026, 1.2, 16), 'triceps', 'muscular', M_DARK);
    // forearm mass
    add(g, limbGeometry(v3(s * 0.222, 0.285, 0.004), v3(s * 0.232, 0.06, 0.01), 0.036, 0.023, 1.3, 16), 'forearm-muscles', 'muscular', M);

    // gluteals
    const glute = add(g, ellipsoidGeometry(0.072, 0.062, 0.055, 18), 'gluteal-muscles', 'muscular', M_DARK, {
      position: v3(s * 0.08, -0.028, -0.048),
    });

    // thigh
    add(g, limbGeometry(v3(s * 0.084, -0.032, 0.03), v3(s * 0.09, -0.43, 0.024), 0.058, 0.042, 1.18, 18), 'quadriceps', 'muscular', M);
    add(g, limbGeometry(v3(s * 0.086, -0.035, -0.032), v3(s * 0.09, -0.43, -0.022), 0.05, 0.032, 1.15, 16), 'hamstrings', 'muscular', M_DARK);
    // patellar ligament + achilles tendon
    add(g, limbGeometry(v3(s * 0.09, -0.445, 0.05), v3(s * 0.086, -0.51, 0.05), 0.012, 0.011, 1, 8), 'tendon', 'muscular', TENDON);
    // calf
    const calf = add(g, ellipsoidGeometry(0.045, 0.1, 0.05, 18), 'calf-muscles', 'muscular', M, { position: v3(s * 0.088, -0.63, -0.035) });
    add(g, limbGeometry(v3(s * 0.088, -0.715, -0.04), v3(s * 0.088, -0.85, -0.032), 0.014, 0.009, 1, 10), 'tendon', 'muscular', TENDON);
  }

  // abdominal wall (six-pack plate + obliques)
  const abs = add(g, roundedBoxGeometry(0.115, 0.19, 0.055, 0.02), 'abdominal-muscles', 'muscular', M, {
    position: v3(0, 0.2, 0.062), rotation: [-0.06, 0, 0],
  });
  for (let i = 0; i < 4; i++) {
    add(g, new THREE.TorusGeometry(0.02, 0.0035, 6, 14), 'abdominal-muscles', 'muscular', M_DARK, {
      position: v3(0, 0.25 - i * 0.038, 0.088), rotation: [Math.PI / 2 - 0.1, 0, 0], scale: [1, 0.7, 1],
    });
  }
  for (const s of [1, -1]) {
    add(g, limbGeometry(v3(s * 0.1, 0.3, 0.03), v3(s * 0.085, 0.06, 0.05), 0.03, 0.022, 1.1, 12), 'abdominal-muscles', 'muscular', M_DARK);
  }

  // trapezius + neck muscles
  const trap = add(g, ellipsoidGeometry(0.125, 0.075, 0.06, 20), 'trapezius', 'muscular', M_DARK, {
    position: v3(0, 0.56, -0.04), rotation: [0.2, 0, 0],
  });
  trap.geometry.scale(1, 1, 0.8);
  for (const s of [1, -1]) {
    add(g, limbGeometry(v3(s * 0.03, 0.72, 0.03), v3(s * 0.075, 0.6, 0.03), 0.016, 0.014, 1.1, 10), 'trapezius', 'muscular', M_DARK);
  }

  // diaphragm: a domed sheet under the lungs
  const domeGeo = new THREE.SphereGeometry(1, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2);
  const dome = add(g, domeGeo, 'diaphragm', 'muscular', '#b04b3c', { position: v3(0, 0.14, 0.0), scale: [0.125, 0.06, 0.095] });
  dome.userData.breathing = true;

  // smooth muscle: rings around the gut + vessel walls
  add(g, new THREE.TorusGeometry(0.062, 0.006, 6, 24), 'smooth-muscle', 'muscular', '#a8534a', {
    position: v3(0, 0.06, 0.01), rotation: [Math.PI / 2, 0, 0],
  });
  add(g, new THREE.TorusGeometry(0.05, 0.005, 6, 24), 'smooth-muscle', 'muscular', '#a8534a', {
    position: v3(0, 0.005, 0.0), rotation: [Math.PI / 2, 0, 0],
  });

  // histology anchor: a muscle fibre bundle
  const bundle = new THREE.Group();
  bundle.name = 'muscle-bundle';
  bundle.visible = false;
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    add(bundle, new THREE.CylinderGeometry(0.011, 0.011, 0.13, 10), 'muscle-overview', 'muscular', i % 2 ? M : M_DARK, {
      position: v3(Math.cos(a) * 0.022, 0, Math.sin(a) * 0.022), rotation: [0, 0, Math.PI / 2],
    });
  }
  g.add(bundle);

  return g;
}

export default buildMuscular;

import * as THREE from 'three';

/* ------------------------------------------------------------------ *
 * Landmarks. One shared coordinate frame, in metres, for the whole
 * body: feet at y = -0.90, crown at y = +0.91 (≈1.8 m tall figure).
 * The body faces +Z, so the anatomical LEFT is on the +X side.
 * ------------------------------------------------------------------ */
export const LM = {
  height: 1.81,
  footBottom: -0.9,
  crown: 0.91,

  head: new THREE.Vector3(0, 0.79, 0),
  headR: 0.105,
  jaw: new THREE.Vector3(0, 0.73, 0.025),
  neck: new THREE.Vector3(0, 0.7, 0.0),
  neckTop: new THREE.Vector3(0, 0.75, 0.0),
  shoulderL: new THREE.Vector3(0.19, 0.555, 0),
  shoulderR: new THREE.Vector3(-0.19, 0.555, 0),
  elbowL: new THREE.Vector3(0.225, 0.29, 0.005),
  elbowR: new THREE.Vector3(-0.225, 0.29, 0.005),
  wristL: new THREE.Vector3(0.235, 0.045, 0.01),
  wristR: new THREE.Vector3(-0.235, 0.045, 0.01),
  handL: new THREE.Vector3(0.242, -0.005, 0.012),
  handR: new THREE.Vector3(-0.242, -0.005, 0.012),

  chest: new THREE.Vector3(0, 0.42, 0.02),
  waist: new THREE.Vector3(0, 0.15, 0.0),
  pelvis: new THREE.Vector3(0, -0.06, 0),
  hipL: new THREE.Vector3(0.085, -0.06, 0),
  hipR: new THREE.Vector3(-0.085, -0.06, 0),
  kneeL: new THREE.Vector3(0.092, -0.45, 0.005),
  kneeR: new THREE.Vector3(-0.092, -0.45, 0.005),
  ankleL: new THREE.Vector3(0.088, -0.83, -0.005),
  ankleR: new THREE.Vector3(-0.088, -0.83, -0.005),
  footL: new THREE.Vector3(0.088, -0.868, 0.045),
  footR: new THREE.Vector3(-0.088, -0.868, 0.045),
};

/** The vertebral column as a smooth curve (kyphosis + lordosis). */
export const SPINE_PATH = [
  new THREE.Vector3(0, 0.74, 0.012),
  new THREE.Vector3(0, 0.68, 0.012),
  new THREE.Vector3(0, 0.6, 0.005),
  new THREE.Vector3(0, 0.48, -0.028),
  new THREE.Vector3(0, 0.36, -0.042),
  new THREE.Vector3(0, 0.22, -0.048),
  new THREE.Vector3(0, 0.09, -0.038),
  new THREE.Vector3(0, 0.025, -0.02),
  new THREE.Vector3(0, -0.03, -0.012),
  new THREE.Vector3(0, -0.055, -0.026),
  new THREE.Vector3(0, -0.085, -0.048),
  new THREE.Vector3(0, -0.112, -0.062),
];

export const spineCurve = () => new THREE.CatmullRomCurve3(SPINE_PATH, false, 'catmullrom', 0.4);

/* ------------------------------------------------------------------ *
 * Materials
 * ------------------------------------------------------------------ */
const materialCache = new Map();

export function material(color, opts = {}) {
  const key = color + JSON.stringify(opts);
  if (materialCache.has(key)) return materialCache.get(key);
  const Material = opts.physical ? THREE.MeshPhysicalMaterial : THREE.MeshStandardMaterial;
  const m = new Material({
    color: new THREE.Color(color),
    roughness: opts.roughness ?? 0.62,
    metalness: opts.metalness ?? 0.05,
    transparent: opts.opacity !== undefined && opts.opacity < 1,
    opacity: opts.opacity ?? 1,
    side: opts.side ?? THREE.FrontSide,
    depthWrite: opts.depthWrite ?? true,
    emissive: new THREE.Color(opts.emissive ?? 0x000000),
    emissiveIntensity: opts.emissiveIntensity ?? 1,
    flatShading: opts.flatShading ?? false,
    ...(opts.physical ? {
      clearcoat: opts.clearcoat ?? 0,
      clearcoatRoughness: opts.clearcoatRoughness ?? 0.35,
      sheen: opts.sheen ?? 0,
      sheenColor: new THREE.Color(opts.sheenColor ?? 0x000000),
      sheenRoughness: opts.sheenRoughness ?? 0.5,
    } : {}),
  });
  materialCache.set(key, m);
  return m;
}

export function highlightMaterial(color) {
  return material(color, { emissive: 0xffcc55, emissiveIntensity: 0.55, roughness: 0.35 });
}

/* ------------------------------------------------------------------ *
 * Geometry helpers. Every helper returns pure geometry so builders can
 * position / rotate / scale freely.
 * ------------------------------------------------------------------ */

export const v3 = (x, y, z) => new THREE.Vector3(x, y, z);

/** Smooth tapered limb between two points (lathe based: no seams). */
export function limbGeometry(a, b, r1, r2, bulge = 1.06, seg = 20, steps = 14) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  const profile = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const base = r1 + (r2 - r1) * t;
    const r = base * (1 + (bulge - 1) * Math.sin(Math.PI * t));
    profile.push(new THREE.Vector2(Math.max(r, 0.002), t * len));
  }
  const geo = new THREE.LatheGeometry(profile, seg);
  geo.translate(0, -len / 2, 0);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  geo.applyQuaternion(q);
  const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
  geo.translate(mid.x, mid.y, mid.z);
  return geo;
}

/** Cylinder between two points (for bones). */
export function boneGeometry(a, b, r1, r2, seg = 12) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  const geo = new THREE.CylinderGeometry(r1, r2, len, seg, 1, false);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  geo.applyQuaternion(q);
  const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
  geo.translate(mid.x, mid.y, mid.z);
  return geo;
}

/** Tube along a list of points (vessels, ducts, gut). */
export function tubeGeometry(points, radius, tubularSegments = 64, radialSegments = 10, closed = false) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => (p.isVector3 ? p : v3(...p))), closed, 'catmullrom', 0.5);
  return new THREE.TubeGeometry(curve, tubularSegments, radius, radialSegments, closed);
}

/** Ellipsoid / blob: organ-friendly, with optional organic displacement. */
export function blobGeometry(radius, detail = 3, wobble = 0, freq = 5, seed = 0) {
  const geo = new THREE.IcosahedronGeometry(radius, detail);
  if (wobble > 0) {
    const pos = geo.attributes.position;
    const p = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      p.fromBufferAttribute(pos, i);
      const n = p.clone().normalize();
      const w =
        1 +
        wobble *
          (Math.sin(n.x * freq + seed) * Math.sin(n.y * freq * 1.3 + seed * 1.7) * Math.sin(n.z * freq * 0.9 + seed * 2.3));
      p.multiplyScalar(w);
      pos.setXYZ(i, p.x, p.y, p.z);
    }
    geo.computeVertexNormals();
  }
  return geo;
}

export function ellipsoidGeometry(rx, ry, rz, detail = 24) {
  const geo = new THREE.SphereGeometry(1, detail, Math.max(8, detail / 2));
  geo.scale(rx, ry, rz);
  return geo;
}

/** Rounded box (nice for flat organs and bone plates). */
export function roundedBoxGeometry(w, h, d, r = 0.01, seg = 3) {
  const shape = new THREE.Shape();
  const rr = Math.min(r, w / 2 - 0.001, h / 2 - 0.001);
  shape.moveTo(-w / 2 + rr, -h / 2);
  shape.lineTo(w / 2 - rr, -h / 2);
  shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + rr);
  shape.lineTo(w / 2, h / 2 - rr);
  shape.quadraticCurveTo(w / 2, h / 2, w / 2 - rr, h / 2);
  shape.lineTo(-w / 2 + rr, h / 2);
  shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - rr);
  shape.lineTo(-w / 2, -h / 2 + rr);
  shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2, -h / 2 + rr);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: d - 2 * rr,
    bevelEnabled: true,
    bevelSize: rr,
    bevelThickness: rr,
    bevelSegments: seg,
    curveSegments: seg + 2,
  });
  geo.translate(0, 0, -(d - 2 * rr) / 2);
  geo.computeVertexNormals();
  return geo;
}

/** Partial torus arc (ribs, arches, rings). */
export function arcGeometry(radius, tube, arc = Math.PI, seg = 32, radialSeg = 8) {
  return new THREE.TorusGeometry(radius, tube, radialSeg, seg, arc);
}

/* ------------------------------------------------------------------ *
 * Mesh assembly
 * ------------------------------------------------------------------ */
export function add(group, geometry, partId, system, matOrColor, opts = {}) {
  const m =
    typeof matOrColor === 'string' || typeof matOrColor === 'number'
      ? material(matOrColor, opts.materialOpts)
      : matOrColor;
  const mesh = new THREE.Mesh(geometry, m);
  mesh.castShadow = opts.castShadow ?? true;
  mesh.receiveShadow = opts.receiveShadow ?? false;
  if (opts.position) mesh.position.copy(opts.position.isVector3 ? opts.position : v3(...opts.position));
  if (opts.rotation) mesh.rotation.set(...opts.rotation);
  if (opts.scale) {
    if (Array.isArray(opts.scale)) mesh.scale.set(...opts.scale);
    else mesh.scale.setScalar(opts.scale);
  }
  mesh.userData = {
    partId,
    system,
    partName: opts.partName ?? partId,
    pickable: opts.pickable ?? true,
    baseMaterial: m,
    isHighlightable: opts.isHighlightable ?? true,
    // Preserve authored transforms so animation never drifts the anatomy.
    basePosition: mesh.position.clone(),
    baseScale: mesh.scale.clone(),
  };
  group.add(mesh);
  return mesh;
}

/** Merge several geometries into one mesh (keeps the draw-call count sane). */
export function mergeGeometries(geometries) {
  const nonIndexed = geometries.map((g) => (g.index ? g.toNonIndexed() : g));
  let total = 0;
  for (const g of nonIndexed) total += g.attributes.position.count;
  const position = new Float32Array(total * 3);
  const normal = new Float32Array(total * 3);
  let offset = 0;
  for (const g of nonIndexed) {
    position.set(g.attributes.position.array, offset * 3);
    if (g.attributes.normal) normal.set(g.attributes.normal.array, offset * 3);
    offset += g.attributes.position.count;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(position, 3));
  geo.setAttribute('normal', new THREE.BufferAttribute(normal, 3));
  geo.computeBoundingSphere();
  return geo;
}

export const UP = new THREE.Vector3(0, 1, 0);

export function midpoint(a, b) {
  return new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
}

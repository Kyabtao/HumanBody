import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { buildHumanoid } from './humanoid.js';
import { PART_BY_ID } from '../data/index.js';
import { SYSTEM_BY_ID } from '../data/systems.js';

const TMP_BOX = new THREE.Box3();
const TMP_VEC = new THREE.Vector3();

export class Viewer {
  constructor(canvas, { onHover, onSelect } = {}) {
    this.canvas = canvas;
    this.onHover = onHover || (() => {});
    this.onSelect = onSelect || (() => {});

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.VSMShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.localClippingEnabled = true;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(38, 1, 0.02, 60);
    this.camera.position.set(1.45, 0.5, 2.85);
    this.homeCamera = this.camera.position.clone();
    this.homeTarget = new THREE.Vector3(0, 0.02, 0);

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.target.set(0, 0.02, 0);
    this.controls.minDistance = 0.35;
    this.controls.maxDistance = 6;
    this.controls.maxPolarAngle = Math.PI * 0.92;

    this._buildEnvironment();

    const human = buildHumanoid('female');
    this.human = human;
    this.scene.add(human.root);
    this.scene.add(human.microRoot);

    // state
    this.visibleSystems = new Set(['surface']);
    this.systemOpacity = {};
    this.level = 1;
    this.isolateSystem = null;
    this.selectedMeshes = [];
    this.hovered = null;
    this.selectedPartId = null;
    this.microMode = false;
    this.microPartId = null;
    this.xray = false;
    this.autoRotate = false;
    this.spin = 0;

    this.clipPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0.5);
    this.clipping = false;

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2(-10, -10);
    this.pointerActive = false;
    this._needsPick = false;

    this._buildHighlightMaterials();
    this._bindEvents();
    this.applyLevel(1);
    this.setSystems(['surface'], { silent: true });

    this.clock = new THREE.Clock();
    this._animating = true;
    this._cameraTween = null;
    this._loop = this._loop.bind(this);
    requestAnimationFrame(this._loop);
  }

  /* ------------------------------------------------------------------ */
  _buildEnvironment() {
    const hemi = new THREE.HemisphereLight(0xdfe9ff, 0x2a2f45, 1.15);
    this.scene.add(hemi);

    const key = new THREE.DirectionalLight(0xffffff, 2.0);
    key.position.set(1.6, 2.2, 2.4);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.near = 0.1;
    key.shadow.camera.far = 8;
    key.shadow.camera.left = -1.4;
    key.shadow.camera.right = 1.4;
    key.shadow.camera.top = 1.6;
    key.shadow.camera.bottom = -1.2;
    key.shadow.bias = -0.0002;
    this.scene.add(key);

    const fill = new THREE.DirectionalLight(0x9fc4ff, 0.55);
    fill.position.set(-2.2, 0.6, 1.2);
    this.scene.add(fill);

    const rim = new THREE.DirectionalLight(0xffd9b0, 0.7);
    rim.position.set(-0.6, 1.0, -2.4);
    this.scene.add(rim);

    // soft ground disc + a faint grid for spatial reference
    const discGeo = new THREE.CircleGeometry(1.05, 64);
    const discMat = new THREE.MeshStandardMaterial({ color: 0x123d4d, roughness: 0.88, metalness: 0.05, transparent: true, opacity: 0.22, depthWrite: false });
    const disc = new THREE.Mesh(discGeo, discMat);
    disc.rotation.x = -Math.PI / 2;
    disc.position.y = -0.913;
    disc.receiveShadow = true;
    this.scene.add(disc);
    this.groundDisc = disc;

    const grid = new THREE.PolarGridHelper(1.0, 8, 6, 64, 0x2a6f80, 0x1d4d5a);
    grid.position.y = -0.910;
    grid.material.transparent = true;
    grid.material.opacity = 0.35;
    this.scene.add(grid);
    this.grid = grid;
  }

  _buildHighlightMaterials() {
    this._hoverMats = new Map();
    this._selectMats = new Map();
  }

  _matFor(cache, base, { color, emissive, intensity }) {
    if (cache.has(base)) return cache.get(base);
    const m = base.clone();
    m.emissive = new THREE.Color(emissive);
    m.emissiveIntensity = intensity;
    m.color = new THREE.Color(color || base.color);
    m.transparent = true;
    m.opacity = Math.min(1, (base.opacity ?? 1) * 1.0 + 0.25);
    cache.set(base, m);
    return m;
  }

  /* ------------------------------------------------------------------ */
  _bindEvents() {
    const c = this.canvas;
    c.addEventListener('pointermove', (e) => {
      const r = c.getBoundingClientRect();
      this.pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      this.pointerActive = true;
      this._needsPick = true;
      this._pointerPx = { x: e.clientX - r.left, y: e.clientY - r.top };
    });
    c.addEventListener('pointerleave', () => {
      this.pointerActive = false;
      this._setHovered(null);
    });
    let down = null;
    c.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; });
    c.addEventListener('pointerup', (e) => {
      if (!down) return;
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
      const dt = performance.now() - down.t;
      if (moved < 6 && dt < 500) {
        const hit = this._pick();
        if (hit) this.selectPart(hit.object.userData.partId, { fromClick: true });
        else this.selectPart(null, { fromClick: true });
      }
      down = null;
    });
  }

  resize() {
    const parent = this.canvas.parentElement;
    const w = parent.clientWidth || window.innerWidth;
    const h = parent.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  /* ------------------------------------------------------------------ */
  /*  Visibility                                                        */
  /* ------------------------------------------------------------------ */
  isMeshVisible(mesh) {
    let o = mesh;
    while (o) {
      if (o.visible === false) return false;
      o = o.parent;
    }
    return true;
  }

  /** Apply level gating + system toggles + isolate + x-ray to every mesh. */
  refreshVisibility() {
    const level = this.level;
    for (const mesh of this.human.allMeshes) {
      const part = PART_BY_ID[mesh.userData.partId];
      const minLevel = part?.minLevel ?? 1;
      const sys = mesh.userData.system;
      let visible = this.visibleSystems.has(sys) && minLevel <= level;
      if (this.isolateSystem && sys !== this.isolateSystem) visible = false;
      if (this.microMode) visible = false;
      mesh.visible = visible;

      // opacity rules
      const base = mesh.userData.baseMaterial;
      const sysOpacity = this.systemOpacity[sys] ?? 1;
      const wantOpacity = this.xray && (sys === 'surface' || sys === 'integumentary') ? 0.18 : sysOpacity;
      if (wantOpacity < 1) {
        const m = this._opacityMat(base, wantOpacity);
        if (mesh !== this.hovered?.object && !this.selectedMeshes.includes(mesh)) mesh.material = m;
        mesh.userData.currentMaterial = m;
      } else {
        if (mesh !== this.hovered?.object && !this.selectedMeshes.includes(mesh)) mesh.material = base;
        mesh.userData.currentMaterial = base;
      }
      mesh.renderOrder = sys === 'integumentary' ? 3 : sys === 'surface' ? 2 : 0;
    }
    // the translucent skin envelope follows the integumentary toggle
    const envelope = this.human.systems.integumentary.getObjectByName('skin-envelope');
    if (envelope) envelope.visible = this.visibleSystems.has('integumentary') && !this.microMode;
  }

  _opacityMat(base, opacity) {
    if (!this._opMats) this._opMats = new Map();
    const key = base.uuid + '|' + opacity.toFixed(2);
    if (this._opMats.has(key)) return this._opMats.get(key);
    const m = base.clone();
    m.transparent = true;
    m.opacity = opacity * (base.opacity ?? 1);
    m.depthWrite = opacity > 0.6;
    m.needsUpdate = true;
    this._opMats.set(key, m);
    return m;
  }

  setSystems(systemIds, { silent = false } = {}) {
    this.visibleSystems = new Set(systemIds);
    if (this.microMode) this.exitMicro();
    this.refreshVisibility();
    if (!silent) this._afterChange();
  }

  toggleSystem(systemId) {
    if (this.microMode && systemId !== 'micro') this.exitMicro();
    if (this.visibleSystems.has(systemId)) this.visibleSystems.delete(systemId);
    else this.visibleSystems.add(systemId);
    this.isolateSystem = null;
    this.refreshVisibility();
    this._afterChange();
    return this.visibleSystems.has(systemId);
  }

  setIsolate(systemId) {
    this.isolateSystem = systemId;
    if (systemId) this.visibleSystems.add(systemId);
    this.refreshVisibility();
    this._afterChange();
  }

  setOpacity(systemId, opacity) {
    this.systemOpacity[systemId] = opacity;
    this.refreshVisibility();
  }

  setXray(on) {
    this.xray = on;
    this.refreshVisibility();
  }

  applyLevel(level) {
    this.level = level;
    this.refreshVisibility();
  }

  setClipping(on, constant = 0.5, axis = 'z') {
    this.clipping = on;
    if (axis === 'z') this.clipPlane.normal.set(0, 0, -1);
    else if (axis === 'y') this.clipPlane.normal.set(0, -1, 0);
    else this.clipPlane.normal.set(-1, 0, 0);
    this.clipPlane.constant = constant;
    this.renderer.clippingPlanes = on ? [this.clipPlane] : [];
    if (this.grid) this.grid.visible = !on;
    if (this.groundDisc) this.groundDisc.visible = !on;
  }

  /* ------------------------------------------------------------------ */
  /*  Picking / selection                                               */
  /* ------------------------------------------------------------------ */
  _pick() {
    if (!this.pointerActive) return null;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const targets = this.microMode
      ? (this._microTargets() || [])
      : this.human.allMeshes.filter((m) => this.isMeshVisible(m));
    const hits = this.raycaster.intersectObjects(targets, false);
    return hits.length ? hits[0] : null;
  }

  _microTargets() {
    const entry = this.human.microModels.get(this._activeMicroModel || '');
    if (!entry) return null;
    const list = [];
    entry.group.traverse((o) => { if (o.isMesh && o.userData.partId) list.push(o); });
    return list;
  }

  _setHovered(hit) {
    const prev = this.hovered;
    if (prev && (!hit || hit.object !== prev.object)) {
      // keep the selection glow if this mesh is also the selected part
      if (this.selectedMeshes.includes(prev.object)) {
        prev.object.material = this._matFor(this._selectMats, prev.material, { emissive: 0x33ddff, intensity: 0.7 });
      } else {
        prev.object.material = prev.material;
      }
    }
    if (!hit) {
      this.hovered = null;
      this.onHover(null);
      return;
    }
    const mesh = hit.object;
    if (!prev || prev.object !== mesh) {
      const base = mesh.userData.currentMaterial || mesh.userData.baseMaterial;
      this.hovered = { object: mesh, material: base };
      mesh.material = this._matFor(this._hoverMats, base, { emissive: 0xffbb55, intensity: 0.45 });
    }
    this.onHover({
      partId: mesh.userData.partId,
      part: PART_BY_ID[mesh.userData.partId],
      point: hit.point,
      screen: this._pointerPx,
    });
  }

  selectPart(partId, { fromClick = false } = {}) {
    // clear previous
    for (const m of this.selectedMeshes) {
      m.material = m.userData.currentMaterial || m.userData.baseMaterial;
    }
    this.selectedMeshes = [];
    this.selectedPartId = partId || null;

    if (!partId) {
      this.onSelect(null);
      return;
    }
    const meshes = (this.human.byPart.get(partId) || []).filter((m) => this.isMeshVisible(m));
    for (const m of meshes) {
      const base = m.userData.currentMaterial || m.userData.baseMaterial;
      m.material = this._matFor(this._selectMats, base, { emissive: 0x33ddff, intensity: 0.7 });
    }
    this.selectedMeshes = meshes;
    this.onSelect(PART_BY_ID[partId] || null, { fromClick });
  }

  focusPart(partId, { zoom = true } = {}) {
    const meshes = this.human.byPart.get(partId) || [];
    const visible = meshes.filter((m) => this.isMeshVisible(m));
    if (!visible.length) return false;
    TMP_BOX.makeEmpty();
    for (const m of visible) {
      m.updateWorldMatrix(true, false);
      const box = new THREE.Box3().setFromObject(m);
      TMP_BOX.union(box);
    }
    TMP_BOX.getCenter(TMP_VEC);
    const size = TMP_BOX.getSize(new THREE.Vector3()).length();
    const dist = Math.max(0.28, size * (zoom ? 2.6 : 4));
    const dir = new THREE.Vector3().subVectors(this.camera.position, this.controls.target).normalize();
    if (dir.lengthSq() < 0.001) dir.set(0.4, 0.15, 1).normalize();
    const target = TMP_VEC.clone();
    const pos = target.clone().add(dir.multiplyScalar(dist));
    this._tweenCamera(pos, target, 620);
    return true;
  }

  focusSystem(systemId) {
    const grp = this.human.systems[systemId];
    if (!grp) return;
    TMP_BOX.setFromObject(grp);
    if (TMP_BOX.isEmpty()) return;
    TMP_BOX.getCenter(TMP_VEC);
    const size = TMP_BOX.getSize(new THREE.Vector3()).length();
    const dir = new THREE.Vector3(0.45, 0.15, 1).normalize();
    this._tweenCamera(TMP_VEC.clone().add(dir.multiplyScalar(size * 1.25)), TMP_VEC.clone(), 700);
  }

  resetView() {
    this._tweenCamera(this.homeCamera.clone(), this.homeTarget.clone(), 600);
  }

  setView(name) {
    const d = 3.05;
    const views = {
      front: [new THREE.Vector3(0, 0.12, d), new THREE.Vector3(0, 0.02, 0)],
      back: [new THREE.Vector3(0, 0.12, -d), new THREE.Vector3(0, 0.02, 0)],
      left: [new THREE.Vector3(d, 0.12, 0), new THREE.Vector3(0, 0.02, 0)],
      right: [new THREE.Vector3(-d, 0.12, 0), new THREE.Vector3(0, 0.02, 0)],
      top: [new THREE.Vector3(0, d * 0.92, 0.06), new THREE.Vector3(0, 0.02, 0)],
      head: [new THREE.Vector3(0.22, 0.96, 0.52), new THREE.Vector3(0, 0.79, 0.02)],
      torso: [new THREE.Vector3(0.42, 0.38, 1.15), new THREE.Vector3(0, 0.24, 0)],
      legs: [new THREE.Vector3(0.4, -0.38, 1.22), new THREE.Vector3(0, -0.48, 0)],
    };
    const v = views[name] || views.front;
    this._tweenCamera(v[0], v[1], 620);
  }

  _tweenCamera(pos, target, ms = 600) {
    this._cameraTween = {
      fromPos: this.camera.position.clone(),
      toPos: pos,
      fromTarget: this.controls.target.clone(),
      toTarget: target,
      start: performance.now(),
      ms,
    };
  }

  /* ------------------------------------------------------------------ */
  /*  Micro view                                                        */
  /* ------------------------------------------------------------------ */
  enterMicro(partId) {
    const resolved = this.human.resolveMicroModel(partId);
    if (!resolved) return false;
    this.microMode = true;
    this._activeMicroModel = resolved === this.human.microModels.get(partId) ? partId : resolvedKey(this.human, resolved);
    for (const [key, entry] of this.human.microModels) {
      entry.group.visible = key === this._activeMicroModel;
      if (entry.parent !== this.human.microRoot && key === this._activeMicroModel) {
        this.human.microRoot.add(entry.group);
      }
    }
    const m = this.human.microModels.get(this._activeMicroModel);
    if (m && m.parent !== this.human.microRoot) m.group.userData._restoreParent = m.parent;
    // park the model at a comfortable viewing size
    const grp = m.group;
    grp.position.set(0, 0, 0);
    grp.rotation.set(0, 0, 0);
    grp.scale.setScalar(1);
    this.human.root.visible = false;
    this.human.microRoot.visible = true;
    this.microPartId = partId;
    this._tweenCamera(new THREE.Vector3(0.25, 0.35, 1.35), new THREE.Vector3(0, 0, 0), 650);
    this.selectPart(partId);
    if (this.grid) this.grid.visible = false;
    if (this.groundDisc) this.groundDisc.visible = false;
    return true;
  }

  exitMicro() {
    if (!this.microMode) return;
    this.microMode = false;
    for (const [key, entry] of this.human.microModels) {
      entry.group.visible = false;
      if (entry.group.parent !== entry.parent) entry.parent.add(entry.group);
    }
    this.human.microRoot.visible = false;
    this.human.root.visible = true;
    if (this.grid) this.grid.visible = !this.clipping;
    if (this.groundDisc) this.groundDisc.visible = !this.clipping;
    this.refreshVisibility();
    this.resetView();
  }

  /* ------------------------------------------------------------------ */
  _afterChange() {
    // nothing heavy; kept for hooks
  }

  /** Female ↔ male reproductive anatomy. */
  setVariant(variant) {
    this.human.setVariant(variant);
    this.refreshVisibility();
    if (this.selectedPartId) this.selectPart(this.selectedPartId);
  }

  setAutoRotate(on) {
    this.autoRotate = on;
    this.controls.autoRotate = on;
    this.controls.autoRotateSpeed = 0.9;
  }

  screenshotName() {
    return `humanbody-${Date.now()}.png`;
  }

  _loop() {
    if (!this._animating) return;
    requestAnimationFrame(this._loop);
    const t = this.clock.getElapsedTime();
    const dt = Math.min(0.05, this.clock.getDelta());

    // camera tween
    if (this._cameraTween) {
      const tw = this._cameraTween;
      const k = Math.min(1, (performance.now() - tw.start) / tw.ms);
      const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      this.camera.position.lerpVectors(tw.fromPos, tw.toPos, e);
      this.controls.target.lerpVectors(tw.fromTarget, tw.toTarget, e);
      if (k >= 1) this._cameraTween = null;
    }

    // heartbeat + breathing
    const beat = Math.pow(Math.sin(t * 2.2), 8) * 0.055;
    const breath = Math.sin(t * 0.9) * 0.5 + 0.5;
    for (const m of this.human.allMeshes) {
      if (!m.visible) continue;
      if (m.userData.beating) {
        const s = 1 + beat;
        const base = m.userData.baseScale || new THREE.Vector3(1, 1, 1);
        m.scale.set(base.x * s, base.y * s * 1.02, base.z * s);
      } else if (m.userData.breathing) {
        const base = m.userData.baseScale || new THREE.Vector3(1, 1, 1);
        const pos = m.userData.basePosition || m.position;
        m.scale.set(base.x * (1 + breath * 0.04), base.y * (1 - breath * 0.16), base.z * (1 + breath * 0.05));
        m.position.set(pos.x, pos.y - breath * 0.012, pos.z);
      }
    }
    // micro models drift slowly for a living feel
    if (this.microMode) {
      const entry = this.human.microModels.get(this._activeMicroModel);
      if (entry) entry.group.rotation.y = Math.sin(t * 0.25) * 0.35;
    }

    if (this._needsPick || this.pointerActive) {
      this._setHovered(this._pick());
      this._needsPick = false;
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this._animating = false;
    this.renderer.dispose();
  }
}

function resolvedKey(human, resolvedEntry) {
  for (const [k, v] of human.microModels) if (v === resolvedEntry) return k;
  return null;
}

export default Viewer;

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import { deviceProfile } from './quality.js';
import { buildHumanoid } from './humanoid.js';
import { ClinicalAnatomy, clinicalPartIdFromHit } from './clinical-models.js';
import { PART_BY_ID } from '../data/index.js';
import { SYSTEM_BY_ID } from '../data/systems.js';

const TMP_BOX = new THREE.Box3();
const TMP_VEC = new THREE.Vector3();

/** A radial falloff used as the ground contact shadow. */
function softShadowTexture() {
  const size = 128;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const grad = ctx.createRadialGradient(size / 2, size / 2, 2, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(2,6,12,0.85)');
  grad.addColorStop(0.55, 'rgba(2,6,12,0.35)');
  grad.addColorStop(1, 'rgba(2,6,12,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/**
 * A studio cyclorama: a vertical gradient with a soft pool of light behind the
 * figure, so the body is photographed against something rather than floating on
 * a flat page. Also gives the bloom pass real pixels to bleed into.
 */
function gradientBackdrop() {
  const c = document.createElement('canvas');
  c.width = 16;
  c.height = 256;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, '#0a1526');
  g.addColorStop(0.42, '#132339');
  g.addColorStop(0.78, '#0c1524');
  g.addColorStop(1, '#05080f');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 16, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.mapping = THREE.EquirectangularReflectionMapping;
  return t;
}

export class Viewer {
  constructor(canvas, { onHover, onSelect } = {}) {
    this.canvas = canvas;
    this.onHover = onHover || (() => {});
    this.onSelect = onSelect || (() => {});

    // One profile decides every quality budget in the scene, so a phone gets a
    // cheaper — but not uglier — version of the same render.
    const q = deviceProfile();
    this.quality = q;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !q.postProcessing, // with post-processing SMAA does the AA instead
      alpha: true,
      powerPreference: q.mobile ? 'default' : 'high-performance',
      stencil: false,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, q.maxPixelRatio));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = q.shadows;
    this.renderer.shadowMap.type = q.softShadows ? THREE.VSMShadowMap : THREE.PCFSoftShadowMap;
    // filmic tone mapping: skin highlights roll off instead of clipping to white
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
    // Touch: one finger orbits the body, two fingers pinch-zoom and pan. Without
    // this the browser's own scroll/zoom steals every gesture on a phone.
    this.controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };
    this.controls.zoomSpeed = q.touch ? 0.8 : 1;
    this.controls.rotateSpeed = q.touch ? 0.75 : 1;
    this.controls.panSpeed = q.touch ? 0.7 : 1;
    this.controls.enablePan = true;

    this._buildEnvironment();
    this._buildComposer();

    const human = buildHumanoid('female', { skin: 'light' });
    this.human = human;
    this.scene.add(human.root);
    this.scene.add(human.microRoot);

    // The immediate procedural teaching model is retained as an offline/load
    // fallback. ClinicalAnatomy progressively swaps each enabled macroscopic
    // system for bundled, source-derived BodyParts3D / Z-Anatomy geometry.
    this.clinical = new ClinicalAnatomy(human, {
      onStatus: (event) => this._onClinicalStatus(event),
    });

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
    this._running = false;
    this._paused = false;
    this._cameraTween = null;
    this._loop = this._loop.bind(this);
    requestAnimationFrame(this._loop);
  }

  /* ------------------------------------------------------------------ *
   * Studio lighting. A body is mostly skin, and skin is a dielectric: it
   * needs something to reflect, so the scene is lit by an image-based
   * environment (a softbox room) plus a key/fill/rim setup, and it stands on
   * a shadow catcher rather than floating in space.
   * ------------------------------------------------------------------ */
  _buildEnvironment() {
    // image-based lighting: gives skin its soft gradient reflections
    const q = this.quality;

    // A studio backdrop rather than a transparent canvas. Beyond looking like a
    // photographic cyclorama, it means the post-processing chain has real pixels
    // to work with — bloom over a transparent buffer composites badly.
    this.scene.background = gradientBackdrop();

    try {
      const pmrem = new THREE.PMREMGenerator(this.renderer);
      this.envTexture = pmrem.fromScene(new RoomEnvironment(), q.envResolution).texture;
      this.scene.environment = this.envTexture;
      this.scene.environmentIntensity = 0.62;
      pmrem.dispose();
    } catch (err) {
      console.warn('environment map unavailable:', err);
    }

    const hemi = new THREE.HemisphereLight(0xdfe9ff, 0x2a2f45, 0.75);
    this.scene.add(hemi);

    const key = new THREE.DirectionalLight(0xfff3e6, 2.15);
    key.position.set(1.6, 2.2, 2.4);
    key.castShadow = q.shadows;
    key.shadow.mapSize.set(q.shadowMapSize, q.shadowMapSize);
    key.shadow.camera.near = 0.1;
    key.shadow.camera.far = 8;
    key.shadow.camera.left = -1.4;
    key.shadow.camera.right = 1.4;
    key.shadow.camera.top = 1.6;
    key.shadow.camera.bottom = -1.2;
    key.shadow.bias = -0.0002;
    key.shadow.radius = 5;
    this.scene.add(key);
    this.key = key;

    // cool fill from the opposite side, so the shadowed flank stays readable
    const fill = new THREE.DirectionalLight(0x9fc4ff, 0.5);
    fill.position.set(-2.2, 0.6, 1.2);
    this.scene.add(fill);

    // rim from behind: separates shoulders, hair and calves from the backdrop
    const rim = new THREE.DirectionalLight(0xffd9b0, 0.95);
    rim.position.set(-0.6, 1.05, -2.4);
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

    // contact shadow: the dark pool where the feet meet the floor
    const pool = new THREE.Mesh(
      new THREE.CircleGeometry(0.5, 48),
      new THREE.MeshBasicMaterial({ map: softShadowTexture(), transparent: true, opacity: 0.5, depthWrite: false })
    );
    pool.rotation.x = -Math.PI / 2;
    pool.position.y = -0.899;
    pool.scale.set(1, 0.62, 1);
    this.scene.add(pool);
    this.contactShadow = pool;

    const grid = new THREE.PolarGridHelper(1.0, 8, 6, 64, 0x2a6f80, 0x1d4d5a);
    grid.position.y = -0.910;
    grid.material.transparent = true;
    grid.material.opacity = 0.3;
    this.scene.add(grid);
    this.grid = grid;
  }

  /**
   * Post-processing. Only on the "high" tier: a whisper of bloom so the
   * highlight/selection glows bleed like real light, and SMAA to keep the
   * silhouette clean now that MSAA is off. Phones skip the whole chain — a
   * full-screen pass at device pixel ratio is the single most expensive thing
   * you can ask a mobile GPU to do.
   */
  _buildComposer() {
    if (!this.quality.postProcessing) {
      this.composer = null;
      return;
    }
    try {
      const size = this.renderer.getSize(new THREE.Vector2());
      const composer = new EffectComposer(this.renderer);
      composer.addPass(new RenderPass(this.scene, this.camera));
      const bloom = new UnrealBloomPass(size, 0.28, 0.7, 0.92);
      composer.addPass(bloom);
      composer.addPass(new OutputPass());
      composer.addPass(new SMAAPass());
      this.composer = composer;
      this.bloomPass = bloom;
    } catch (err) {
      console.warn('post-processing unavailable, falling back to direct render:', err);
      this.composer = null;
    }
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

  /** Bridge the asynchronous clinical asset loader to the app/UI hooks. */
  _onClinicalStatus(event) {
    if (event.state === 'ready') {
      this._setHovered(null);
      // An opacity clone may retain the previous complexion. Recreate it on
      // the next visibility pass from the newly loaded source material.
      this._opMats?.clear();
      this.refreshVisibility();
      if (this.selectedPartId) this.selectPart(this.selectedPartId);
      this.onModelRebuilt?.();
    }
    this.onClinicalStatus?.(event);
  }

  /* ------------------------------------------------------------------ */
  _bindEvents() {
    const c = this.canvas;
    const setPointer = (e) => {
      const r = c.getBoundingClientRect();
      this.pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      this._pointerPx = { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    c.addEventListener('pointermove', (e) => {
      // A finger dragging the body is orbiting, not hovering: only a mouse gets
      // the live hover label, otherwise the tooltip chases the drag.
      if (e.pointerType !== 'mouse') return;
      setPointer(e);
      this.pointerActive = true;
      this._needsPick = true;
    });
    c.addEventListener('pointerleave', () => {
      this.pointerActive = false;
      this._setHovered(null);
    });

    let down = null;
    let multi = 0;
    c.addEventListener('pointerdown', (e) => {
      multi++;
      down = { x: e.clientX, y: e.clientY, t: performance.now(), type: e.pointerType, multi };
    });
    const endPointer = (e) => {
      multi = Math.max(0, multi - 1);
      if (!down) return;
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
      const dt = performance.now() - down.t;
      // touch fingers wobble: allow a slightly bigger slop before we call it a drag
      const slop = down.type === 'mouse' ? 6 : 12;
      const wasPinch = down.multi > 1 || multi > 0;
      if (moved < slop && dt < 500 && !wasPinch) {
        setPointer(e);
        this.pointerActive = true;
        const hit = this._pick();
        if (hit) this.selectPart(this.partIdForHit(hit), { fromClick: true });
        else this.selectPart(null, { fromClick: true });
        // a tap should not leave a hover glow stuck on the model
        if (down.type !== 'mouse') {
          this.pointerActive = false;
          this._setHovered(null);
        }
      }
      down = null;
    };
    c.addEventListener('pointerup', endPointer);
    c.addEventListener('pointercancel', () => { multi = Math.max(0, multi - 1); down = null; });
  }

  resize() {
    const parent = this.canvas.parentElement;
    const w = parent.clientWidth || window.innerWidth;
    const h = parent.clientHeight || window.innerHeight;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.quality.maxPixelRatio));
    this.renderer.setSize(w, h, false);
    if (this.composer) this.composer.setSize(w, h);
    this.camera.aspect = w / h;
    // A phone held upright is a tall, narrow window: at a fixed field of view the
    // body would be cropped at the head and feet. Widen the vertical FOV as the
    // frame gets narrower so the whole figure always fits.
    const portrait = THREE.MathUtils.clamp(h / Math.max(1, w), 1, 2.2);
    this.camera.fov = w >= h ? 38 : THREE.MathUtils.clamp(38 * (0.72 + portrait * 0.38), 38, 62);
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
      const minLevel = mesh.userData.minLevel ?? part?.minLevel ?? 1;
      const sys = mesh.userData.system;
      const isClinical = Boolean(mesh.userData.referenceComposite);
      let visible = this.visibleSystems.has(sys) && minLevel <= level;
      if (this.isolateSystem && sys !== this.isolateSystem) visible = false;
      if (this.microMode) visible = false;

      if (isClinical) {
        // The bundled organ export has a male reproductive sub-layer. Keep the
        // educational female fallback for that one layer when female is chosen.
        if (mesh.userData.referenceSex && mesh.userData.referenceSex !== this.human.variant) visible = false;
        mesh.userData.hiddenByReference = false;
      } else if (this.human.isReferenceActiveForSystem?.(sys)) {
        // A source-derived mesh now supplies this layer; do not stack a blob or
        // tube-shaped fallback directly inside it. The 2D interactive-overlay
        // mode can still deliberately project this flagged fallback.
        visible = false;
        mesh.userData.hiddenByReference = true;
      } else {
        mesh.userData.hiddenByReference = false;
      }
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

    // The selected source submesh is a separate, short-lived overlay. It needs
    // the same system/isolation rules as the combined source layer beneath it.
    const highlight = this.human.referenceHighlight;
    if (highlight) {
      const canShow = (highlight.userData.systems || []).some((sys) =>
        this.visibleSystems.has(sys)
        && (!this.isolateSystem || this.isolateSystem === sys)
        && this.human.isReferenceActiveForSystem?.(sys)
      );
      highlight.visible = canShow && !this.microMode;
    }

    // The translucent procedural envelope is useful when no source body surface
    // is displayed. Avoid putting it over the authentic surface mesh.
    const envelope = this.human.systems.integumentary.getObjectByName('skin-envelope');
    const referenceSurfaceShown = this.visibleSystems.has('surface') && this.human.isReferenceActiveForSystem?.('surface');
    if (envelope) envelope.visible = this.visibleSystems.has('integumentary') && !this.microMode && !referenceSurfaceShown;
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
    this.clinical?.ensureSystems(systemIds);
    this.refreshVisibility();
    if (!silent) this._afterChange();
  }

  toggleSystem(systemId) {
    if (this.microMode && systemId !== 'micro') this.exitMicro();
    if (this.visibleSystems.has(systemId)) this.visibleSystems.delete(systemId);
    else this.visibleSystems.add(systemId);
    this.isolateSystem = null;
    this.clinical?.ensureSystems([systemId]);
    this.refreshVisibility();
    this._afterChange();
    return this.visibleSystems.has(systemId);
  }

  setIsolate(systemId) {
    this.isolateSystem = systemId;
    if (systemId) this.visibleSystems.add(systemId);
    if (systemId) this.clinical?.ensureSystems([systemId]);
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

  /** A combined clinical mesh stores its semantic id per source triangle. */
  partIdForHit(hit) {
    return clinicalPartIdFromHit(hit);
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
    const partId = this.partIdForHit(hit);
    if (!prev || prev.object !== mesh) {
      const base = mesh.userData.currentMaterial || mesh.userData.baseMaterial;
      this.hovered = { object: mesh, material: base };
      // Tinting a source composite would light up an entire 3D system when the
      // cursor is over one bone/vessel. Its precise name still appears in the
      // hover label, and selection draws an exact submesh overlay instead.
      if (!mesh.userData.referenceComposite) {
        mesh.material = this._matFor(this._hoverMats, base, { emissive: 0xffbb55, intensity: 0.45 });
      }
    }
    this.onHover({
      partId,
      part: PART_BY_ID[partId],
      point: hit.point,
      screen: this._pointerPx,
    });
  }

  selectPart(partId, { fromClick = false } = {}) {
    // clear previous teaching-mesh material + any extracted clinical overlay
    for (const m of this.selectedMeshes) {
      m.material = m.userData.currentMaterial || m.userData.baseMaterial;
    }
    this.human.clearReferenceHighlight?.();
    this.selectedMeshes = [];
    this.selectedPartId = partId || null;

    if (!partId) {
      if (fromClick) this.onSelect(null, { fromClick });
      return;
    }
    const meshes = (this.human.byPart.get(partId) || []).filter((m) => this.isMeshVisible(m));
    for (const m of meshes) {
      const base = m.userData.currentMaterial || m.userData.baseMaterial;
      m.material = this._matFor(this._selectMats, base, { emissive: 0x33ddff, intensity: 0.7 });
    }
    this.selectedMeshes = meshes;

    const clinicalHighlight = this.human.setReferenceHighlight?.(partId);
    if (clinicalHighlight) {
      const systems = clinicalHighlight.userData.systems || [];
      clinicalHighlight.visible = !this.microMode && systems.some((sys) =>
        this.visibleSystems.has(sys)
        && (!this.isolateSystem || this.isolateSystem === sys)
        && this.human.isReferenceActiveForSystem?.(sys)
      );
    }
    // UI-originated selections already render their own details. Emit only for
    // an actual canvas click; otherwise the UI callback would select again.
    if (fromClick) this.onSelect(PART_BY_ID[partId] || null, { fromClick });
  }

  /** Whether an enabled clinical layer contains this coarse atlas part. */
  hasVisibleReferencePart(partId) {
    const sources = this.human.referencePart?.(partId) || [];
    return sources.some((source) => this.isMeshVisible(source.mesh));
  }

  focusPart(partId, { zoom = true } = {}) {
    // Selecting a source-derived structure lazily creates its exact geometry
    // overlay. Focus that rather than a whole one-draw-call system composite.
    let clinical = this.human.referenceHighlight;
    if (!clinical || clinical.name !== `clinical-selection-${partId}`) {
      clinical = this.human.setReferenceHighlight?.(partId) || null;
      if (clinical) {
        const systems = clinical.userData.systems || [];
        clinical.visible = !this.microMode && systems.some((sys) => this.visibleSystems.has(sys) && (!this.isolateSystem || this.isolateSystem === sys));
      }
    }
    if (clinical && clinical.visible) {
      clinical.updateWorldMatrix(true, true);
      TMP_BOX.setFromObject(clinical);
    } else {
      const meshes = this.human.byPart.get(partId) || [];
      const visible = meshes.filter((m) => this.isMeshVisible(m));
      if (!visible.length) return false;
      TMP_BOX.makeEmpty();
      for (const m of visible) {
        m.updateWorldMatrix(true, false);
        const box = new THREE.Box3().setFromObject(m);
        TMP_BOX.union(box);
      }
    }
    if (TMP_BOX.isEmpty()) return false;
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

  /**
   * Frame a set of parts at once. The body-part tree uses this to point the
   * camera at a region or branch instead of a single structure, so the meshes
   * are unioned whether or not the teaching fallback is currently on screen —
   * the camera only needs the extent, not the visibility.
   */
  focusParts(partIds = [], { zoom = true } = {}) {
    if (!partIds.length || this.microMode) return false;
    const meshes = [];
    for (const id of partIds) meshes.push(...(this.human.byPart.get(id) || []));
    if (!meshes.length) return false;
    TMP_BOX.makeEmpty();
    for (const mesh of meshes) {
      mesh.updateWorldMatrix(true, false);
      TMP_BOX.union(new THREE.Box3().setFromObject(mesh));
    }
    if (TMP_BOX.isEmpty()) return false;
    TMP_BOX.getCenter(TMP_VEC);
    const size = TMP_BOX.getSize(new THREE.Vector3()).length();
    const dist = Math.max(0.34, size * (zoom ? 1.25 : 1.9));
    const dir = new THREE.Vector3(0.42, 0.16, 1).normalize();
    this._tweenCamera(TMP_VEC.clone().add(dir.multiplyScalar(dist)), TMP_VEC.clone(), 700);
    return true;
  }

  focusSystem(systemId) {
    const meshes = this.human.allMeshes.filter((mesh) => mesh.userData.system === systemId && this.isMeshVisible(mesh));
    if (!meshes.length) return;
    TMP_BOX.makeEmpty();
    for (const mesh of meshes) TMP_BOX.union(new THREE.Box3().setFromObject(mesh));
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

  /** Female ↔ male: reproductive anatomy plus the whole body type. */
  setVariant(variant) {
    this._setHovered(null);
    this.selectedMeshes = [];
    this.human.setVariant(variant);
    this.refreshVisibility();
    if (this.selectedPartId) this.selectPart(this.selectedPartId);
    if (this.onModelRebuilt) this.onModelRebuilt();
  }

  /** Complexion of the figure (skin, hair and lip tones follow it). */
  setSkin(toneId) {
    this.human.setSkin(toneId);
    this._setHovered(null);
    this.selectedMeshes = [];
    this._opMats?.clear();
    this.refreshVisibility();
    if (this.selectedPartId) this.selectPart(this.selectedPartId);
    if (this.onSkinChange) this.onSkinChange(toneId);
  }

  /** Stop rendering while another view (the 2D plate) is on screen. */
  setPaused(on) {
    this._paused = on;
    if (!on && this._animating && !this._running) {
      this._running = true;
      requestAnimationFrame(this._loop);
    }
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
    if (this._paused) return;
    const t = this.clock.getElapsedTime();
    const dt = Math.min(0.05, this.clock.getDelta());
    this._running = true;

    // a standing body is never perfectly still: weight shifts, breath moves
    if (!this.microMode && !this.clipping && !this.autoRotate) {
      this.human.root.rotation.y = Math.sin(t * 0.31) * 0.022;
      this.human.root.position.y = Math.sin(t * 0.62 + 0.7) * 0.0035;
      this.human.root.rotation.z = Math.sin(t * 0.21) * 0.004;
    }

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
    if (this.composer) this.composer.render();
    else this.renderer.render(this.scene, this.camera);
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

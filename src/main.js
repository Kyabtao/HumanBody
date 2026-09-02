import { Viewer } from './scene/viewer.js';
import { PlateView } from './atlas/stage2d.js';
import { referencePlateFor } from './atlas/reference.js';
import { SKIN_TONES } from './scene/anatomy.js';
import { SYSTEMS, SYSTEM_BY_ID } from './data/systems.js';
import { LEVELS, LEVEL_BY_ID, bestDetailFor } from './data/levels.js';
import { ALL_PARTS, PART_BY_ID, ATLAS_STATS, partsForSystem, partsForLevel, searchParts } from './data/index.js';
import { makeQuestions } from './quiz.js';
import { buildHumanoid } from './scene/humanoid.js';
import { TOURS } from './data/tours.js';
import { MobileShell } from './mobile.js';
import { PartTree, nodeTitle } from './tree.js';
import { buildTree, partIdsUnder, pathToPart, trailLabel, TREE_REGIONS } from './data/tree.js';

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const LEVEL_SYSTEMS = {
  1: ['surface'],
  2: ['surface', 'skeletal', 'muscular', 'nervous', 'cardiovascular', 'respiratory', 'digestive', 'urinary'],
  3: ['surface', 'skeletal', 'muscular', 'nervous', 'cardiovascular', 'respiratory', 'digestive', 'urinary', 'endocrine', 'lymphatic', 'integumentary'],
  4: ['surface', 'skeletal', 'muscular', 'nervous', 'cardiovascular', 'respiratory', 'digestive', 'urinary', 'endocrine', 'lymphatic', 'integumentary', 'reproductive'],
  5: SYSTEMS.map((s) => s.id),
};

const TIERS = [
  { key: 'basic', label: 'Class 1–5 · In simple words', min: 1 },
  { key: 'middle', label: 'Class 6–8 · School level', min: 2 },
  { key: 'high', label: 'Class 9–10 · Senior school', min: 3 },
  { key: 'undergrad', label: 'Undergraduate / MBBS', min: 4 },
  { key: 'phd', label: 'MD / PhD · Research level', min: 5 },
];

const state = {
  level: 1,
  activeSystem: null,
  selectedPartId: null,
  visible: new Set(LEVEL_SYSTEMS[1]),
  xray: false,
  spin: false,
  clip: false,
  quiz: null,
  tour: null,
  tourStep: 0,
  variant: 'female',
  // '3d' = the rotating model · '2d' = the flat plate image projected from it
  mode: '3d',
  view: 'front',
  // The default 2D view is an independently licensed clinical illustration.
  // Learners can switch back to the projected, clickable teaching overlay.
  plateStyle: 'reference',
  plateLabels: true,
  skin: 'light',
  // 'tree' = the regional body-part tree · 'list' = one flat list
  browse: 'tree',
  // the region or branch whose layers were last lit up from the tree
  treeNode: null,
};

let viewer = null;
let plate = null;
let hoverEl = null;
let mobile = null;
let partTree = null;

/* ==================================================================== */
/*  Boot                                                                */
/* ==================================================================== */
function boot() {
  const canvas = $('#scene');
  hoverEl = $('#hoverLabel');

  try {
    viewer = new Viewer(canvas, {
      onHover: handleHover,
      onSelect: (part) => {
        if (part) showPart(part.id, { focus: false, from3d: true });
      },
    });
  } catch (err) {
    console.error('WebGL unavailable:', err);
    viewer = createFallbackViewer(canvas);
    showWebGLNotice();
  }
  window.__viewer = viewer; // handy for debugging
  viewer.onModelRebuilt = () => {
    renderPlate();
    queueTreeRefresh(); // which parts can be zoomed to changes with the model
    if (state.selectedPartId) renderDetails(PART_BY_ID[state.selectedPartId]);
  };
  viewer.onClinicalStatus = (event) => {
    updateClinicalBadge(event);
    queueTreeRefresh();
  };

  viewer.resize();
  // Phones fire resize on every scroll of the URL bar and on rotation; coalesce
  // them into one relayout per frame so we never rebuild the plate mid-gesture.
  let resizeTimer = null;
  const relayout = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      viewer.resize();
      if (state.mode === '2d') renderPlate();
    }, 120);
  };
  window.addEventListener('resize', relayout);
  window.addEventListener('orientationchange', () => setTimeout(relayout, 200));
  if (window.visualViewport) window.visualViewport.addEventListener('resize', relayout);

  // 2D starts as a licensed clinical reference; the optional overlay remains
  // a second rendering of the teaching model with hover/click/system controls.
  plate = new PlateView($('#plateStage'), {
    onHover: (info) => handleHover(info),
    onLeave: () => handleHover(null),
    onSelect: (id) => showPart(id, { focus: false }),
  });

  // the phone shell: same panels, presented as bottom sheets behind a tab bar
  mobile = new MobileShell({
    actions: {
      tour: () => openTour(),
      quiz: () => openQuiz({ systemId: state.activeSystem }),
      mode: () => setMode(state.mode === '3d' ? '2d' : '3d'),
      reset: () => { viewer.exitMicro(); viewer.resetView(); if (plate) plate.resetView(); },
      help: () => ($('#helpModal').hidden = false),
    },
    onSheetChange: () => {
      // a sheet changes how much of the canvas is visible
      viewer.resize();
      if (state.mode === '2d') renderPlate();
    },
  });

  buildLevelSwitch();
  buildSystemList();
  buildComplexion();
  buildPartTree();
  renderParts();
  setBrowse('tree');
  wireUI();
  updateStatus();
  updateClinicalBadge();
  setMode('3d');
  // with no WebGL there is nothing to spin — open the flat plate instead
  if (viewer.fallback) setMode('2d');
  openHelpIfFirstVisit();

  requestAnimationFrame(() => {
    $('#loading').classList.add('hidden');
    setTimeout(() => $('#loading').remove(), 700);
  });
}

/* ==================================================================== */
/*  3D ⇄ 2D                                                            */
/* ==================================================================== */
function setMode(mode) {
  state.mode = mode;
  document.body.classList.toggle('mode-2d', mode === '2d');
  document.body.classList.toggle('mode-3d', mode !== '2d');
  $$('#modeSwitch .mode-btn').forEach((b) => b.classList.toggle('active', b.dataset.mode === mode));
  $('#plateGroup').hidden = mode !== '2d';
  $('#plateMeta').hidden = mode !== '2d';
  $('#sliceGroup').hidden = mode === '2d' || !state.clip;
  updatePlateStyleControl();
  if (mode === '2d') {
    renderPlate();
    flashStatus(state.plateStyle === 'reference'
      ? 'Real 2D reference plate — use the layer list to study structures, or switch to the interactive overlay to click regions.'
      : 'Interactive 2D overlay — drag to pan, scroll to zoom, click a region to study it. Press P for the 3D model.');
  } else {
    $('#statusText').textContent = 'Click any part of the body to learn about it.';
  }
  const modeBtn = document.querySelector('[data-more="mode"]');
  if (modeBtn) modeBtn.textContent = mode === '2d' ? '🧍 3D model' : '🖼 2D plate';
  if (viewer.setPaused) viewer.setPaused(mode === '2d');
}

/** Render either an authentic licensed plate or the app's clickable projection. */
function renderPlate() {
  if (state.mode !== '2d' || !plate || !viewer) return;
  const opts = {
    view: state.view,
    systems: state.visible,
    level: state.level,
    isolate: viewer.isolateSystem,
    xray: state.xray,
    labels: state.plateLabels,
    selected: state.selectedPartId,
  };
  const selectedSystem = PART_BY_ID[state.selectedPartId]?.system || null;
  const useReference = state.plateStyle === 'reference';
  const ref = useReference ? referencePlateFor({
    activeSystem: state.activeSystem,
    selectedSystem,
    visibleSystems: state.visible,
  }) : null;
  const ms = ref ? plate.renderReference(ref, opts) : plate.render(viewer.human, opts);
  updatePlateStyleControl();

  const meta = $('#plateMeta');
  if (meta) {
    if (ref) {
      meta.innerHTML = `<b>Real reference 2D</b> · ${ref.title} · <a href="${ref.sourceUrl}" target="_blank" rel="noopener noreferrer">source &amp; licence ↗</a>`;
    } else {
      const n = plate.plate ? plate.plate.regions.length : 0;
      meta.innerHTML = `<b>${plate.plate ? plate.plate.view : ''}</b> · ${n} regions · ${ms} ms · interactive projection`;
    }
  }
}

function updatePlateStyleControl() {
  const button = $('#btnPlateStyle');
  const labels = $('#btnPlateLabels');
  const svg = $('#btnPlateSVG');
  const png = $('#btnPlatePNG');
  if (!button) return;
  const isReference = state.plateStyle === 'reference';
  button.classList.toggle('active', isReference);
  button.textContent = isReference ? '✦ Real reference' : '◌ Interactive overlay';
  button.title = isReference
    ? 'Showing a licensed source illustration. Click for the interactive projected overlay.'
    : 'Showing the clickable projected overlay. Click for a real source illustration.';
  if (labels) labels.hidden = isReference;
  if (svg) svg.hidden = isReference;
  if (png) png.textContent = isReference ? '⬇ PNG' : '🖼 PNG';
}

function togglePlateStyle() {
  state.plateStyle = state.plateStyle === 'reference' ? 'interactive' : 'reference';
  renderPlate();
  flashStatus(state.plateStyle === 'reference'
    ? 'Real 2D reference plate: an independently licensed medical illustration. Use the layer list to study structures.'
    : 'Interactive 2D overlay: click regions, drag to pan and scroll to zoom.');
}

function togglePlateLabels() {
  state.plateLabels = !state.plateLabels;
  $('#btnPlateLabels').classList.toggle('active', state.plateLabels);
  renderPlate();
}

function savePlate(kind) {
  if (!plate || (!plate.plate && !plate.reference)) return;
  if (plate.reference) {
    plate.referencePNG().then((blob) => {
      if (!blob) return flashStatus('Could not fetch the bundled reference image in this browser.');
      downloadBlob(blob, `humanbody-reference-${plate.reference.id}.png`);
      flashStatus(`Reference PNG saved. Please keep its source credit: ${plate.reference.attribution}.`);
    });
    return;
  }
  const sys = [...state.visible].map((id) => SYSTEM_BY_ID[id]?.name).filter(Boolean).join(' · ');
  const caption = `${LEVEL_BY_ID[state.level].short} — ${sys || 'all systems'}`;
  if (kind === 'svg') {
    const svg = plate.toSVGString({ title: `HumanBody · ${plate.plate.view} plate`, subtitle: caption });
    downloadText(svg, `humanbody-plate-${state.view}.svg`, 'image/svg+xml');
    flashStatus('Plate saved as an SVG image — it stays sharp at any size, from a phone to a poster.');
    return;
  }
  flashStatus('Rendering the plate to a PNG image…');
  plate.toPNG(2).then((blob) => {
    if (!blob) return flashStatus('Could not rasterise the plate in this browser — try the SVG instead.');
    downloadBlob(blob, `humanbody-plate-${state.view}.png`);
    flashStatus('Plate saved as a PNG image.');
  });
}

function downloadText(text, name, mime) {
  downloadBlob(new Blob([text], { type: mime }), name);
}

function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/** Complexion picker: the figure's skin, hair and lip tones. */
function buildComplexion() {
  const host = $('#complexion');
  if (!host) return;
  host.innerHTML = SKIN_TONES.map((t) => `<button class="tone${t.id === state.skin ? ' active' : ''}" data-skin="${t.id}" title="${t.name}" aria-label="${t.name}" style="background:${t.base}"></button>`).join('')
    + `<button class="chip tiny" id="btnVariant2" title="Switch the body type">${state.variant === 'female' ? '♀ body' : '♂ body'}</button>`;
  host.querySelectorAll('[data-skin]').forEach((b) => {
    b.onclick = () => {
      state.skin = b.dataset.skin;
      if (viewer.setSkin) viewer.setSkin(state.skin);
      buildComplexion();
      renderPlate();
      const tone = SKIN_TONES.find((t) => t.id === state.skin);
      flashStatus(`Complexion set to ${tone.name.toLowerCase()}.`);
    };
  });
  const vb = host.querySelector('#btnVariant2');
  if (vb) vb.onclick = () => setVariant();
}

function setVariant() {
  state.variant = state.variant === 'female' ? 'male' : 'female';
  viewer.setVariant(state.variant);
  buildSystemList();
  buildComplexion();
  renderParts();
  renderPlate();
  if (state.selectedPartId) showPart(state.selectedPartId, { focus: false });
  flashStatus(
    state.variant === 'female'
      ? 'Female mode: source adult anatomy remains available; female reproductive teaching anatomy is retained.'
      : 'Male mode: matching source reproductive anatomy is available with the adult reference.'
  );
}

/* ==================================================================== */
/*  Level switch                                                       */
/* ==================================================================== */
function buildLevelSwitch() {
  const wrap = $('#levelSwitch');
  wrap.innerHTML = '';
  LEVELS.forEach((lv) => {
    const b = document.createElement('button');
    b.className = 'level-btn' + (lv.id === state.level ? ' active' : '');
    b.innerHTML = `${lv.short}<small>${lv.subtitle}</small>`;
    b.title = `${lv.title} — ${lv.blurb}`;
    b.onclick = () => setLevel(lv.id);
    wrap.appendChild(b);
  });
}

function setLevel(level) {
  state.level = level;
  $$('.level-btn').forEach((b, i) => b.classList.toggle('active', LEVELS[i].id === level));
  state.visible = new Set(LEVEL_SYSTEMS[level] || LEVEL_SYSTEMS[5]);
  viewer.applyLevel(level);
  viewer.setSystems([...state.visible]);
  if (level < 4 && viewer.microMode) viewer.exitMicro();
  buildSystemList();
  renderParts();
  if (state.selectedPartId) showPart(state.selectedPartId, { focus: false });
  renderPlate();
  updateStatus();
  const lv = LEVEL_BY_ID[level];
  flashStatus(`Level set to ${lv.title} — ${lv.subtitle}. ${lv.blurb}`);
}

/* ==================================================================== */
/*  System list                                                        */
/* ==================================================================== */
function buildSystemList() {
  const list = $('#systemList');
  list.innerHTML = '';
  for (const sys of SYSTEMS) {
    const parts = partsForSystem(sys.id).filter((p) => (p.minLevel ?? 1) <= state.level);
    const row = document.createElement('div');
    row.className = 'sys-item' + (state.visible.has(sys.id) ? ' on' : '') + (state.activeSystem === sys.id ? ' filtered' : '');
    row.dataset.system = sys.id;
    row.innerHTML = `
      <span class="dot" style="color:${sys.color};background:${sys.color}"></span>
      <span class="sys-name">${sys.name}</span>
      <span class="sys-count">${parts.length}</span>
      <button class="iso" title="Show only this system">only</button>
      ${sys.id === 'reproductive' ? `<button class="iso" data-variant="1" title="Switch between female and male anatomy">${state.variant === 'female' ? '♀→♂' : '♂→♀'}</button>` : ''}`;
    row.onclick = (e) => {
      if (e.target.dataset.variant) {
        setVariant();
        return;
      }
      if (e.target.classList.contains('iso')) {
        viewer.setIsolate(sys.id);
        state.visible = new Set([sys.id]);
        buildSystemList();
        renderPlate();
        return;
      }
      if (e.target.classList.contains('dot')) {
        toggleSystem(sys.id);
        return;
      }
      if (state.activeSystem === sys.id) {
        state.activeSystem = null; // click again to show every system's parts
      } else {
        state.activeSystem = sys.id;
        if (!state.visible.has(sys.id)) toggleSystem(sys.id);
      }
      buildSystemList();
      renderParts();
      renderPlate();
    };
    list.appendChild(row);
  }
}

function toggleSystem(id) {
  const on = viewer.toggleSystem(id);
  if (on) state.visible.add(id);
  else state.visible.delete(id);
  buildSystemList();
  renderParts();
  renderPlate();
}

/* ==================================================================== */
/*  Parts list                                                         */
/* ==================================================================== */
function renderParts() {
  const list = $('#partList');
  const sys = state.activeSystem ? SYSTEM_BY_ID[state.activeSystem] : null;
  $('#partsTitle').textContent = state.browse === 'tree'
    ? (state.treeNode ? nodeTitle(state.treeNode) : 'Body Part Tree')
    : (sys ? sys.name : 'All parts');
  let parts = sys ? partsForSystem(sys.id) : partsForLevel(state.level);
  parts = parts.filter((p) => (p.minLevel ?? 1) <= state.level);
  $('#partsCount').textContent = `${parts.length}`;
  list.innerHTML = '';
  for (const p of parts) {
    const el = document.createElement('div');
    el.className = 'part-item' + (p.id === state.selectedPartId ? ' active' : '');
    el.innerHTML = `<span style="color:${SYSTEM_BY_ID[p.system].color}">•</span>
      <span>${p.name}</span>
      <span class="latin">${p.latin || ''}</span>`;
    el.onclick = () => showPart(p.id, { focus: true });
    list.appendChild(el);
  }
  renderTree();
}

/* ==================================================================== */
/*  Body-part tree: region → branch → part                             */
/* ==================================================================== */
/** Whether a part can be pointed at on screen right now (either 3D source). */
function partIsVisible(partId) {
  if (!viewer) return false;
  if (viewer.hasVisibleReferencePart?.(partId)) return true;
  return (viewer.human?.byPart.get(partId) || []).some((m) => viewer.isMeshVisible(m));
}

function buildPartTree() {
  partTree = new PartTree($('#partTree'), {
    onSelect: (id) => showPart(id, { focus: true }),
    onZoom: (id) => focusPartInView(id),
    onShowLayers: (nodeId) => showTreeNode(nodeId),
    onQuizNode: (nodeId) => openQuiz({ nodeId }),
    isPartVisible: partIsVisible,
    // the tree and the filter box above it are one control, so keep them in step
    onFilterChange: (value) => { const input = $('#treeFilter'); if (input) input.value = value; },
  });
}

/** A clinical layer arriving mid-read should not flicker the rail, so coalesce. */
let treeRefreshFrame = 0;
function queueTreeRefresh() {
  if (!partTree || treeRefreshFrame) return;
  treeRefreshFrame = requestAnimationFrame(() => {
    treeRefreshFrame = 0;
    renderTree();
  });
}

function renderTree() {
  if (!partTree) return;
  const tree = buildTree({ level: state.level });
  const open = tree.reduce((n, r) => n + r.count, 0);
  const total = tree.reduce((n, r) => n + r.count + r.lockedCount, 0);
  if (state.browse === 'tree') $('#partsCount').textContent = `${open}/${total}`;
  partTree.refresh({ level: state.level, selectedPartId: state.selectedPartId });
}

/** Switch the parts rail between the regional tree and the flat list. */
function setBrowse(mode) {
  state.browse = mode === 'list' ? 'list' : 'tree';
  const tree = state.browse === 'tree';
  $$('#browseSwitch .seg-btn').forEach((b) => b.classList.toggle('active', b.dataset.browse === state.browse));
  $('#partTree').hidden = !tree;
  $('#treeBar').hidden = !tree;
  $('#partList').hidden = tree;
  renderParts();
  if (tree && state.selectedPartId) partTree.reveal(state.selectedPartId);
}

/** Light up only the layers a branch or region needs, and frame it. */
function showTreeNode(nodeId, { focus = true } = {}) {
  const parts = partIdsUnder(nodeId)
    .map((id) => PART_BY_ID[id])
    .filter((p) => p && (p.minLevel ?? 1) <= state.level);
  if (!parts.length) {
    flashStatus('Nothing in that branch is unlocked at this level yet — raise the level to see it.');
    return;
  }
  const systems = [...new Set(parts.map((p) => p.system))];
  state.treeNode = nodeId;
  state.activeSystem = null;
  state.visible = new Set(systems);
  viewer.setIsolate(null);
  viewer.setSystems(systems);
  buildSystemList();
  renderParts();
  if (focus) {
    if (state.mode === '3d') viewer.focusParts(parts.map((p) => p.id));
    else if (plate) plate.resetView();
    renderPlate();
  }
  const names = systems.map((s) => `${SYSTEM_BY_ID[s].icon || ''}${SYSTEM_BY_ID[s].name}`).join(' · ');
  flashStatus(`${nodeTitle(nodeId)}: ${parts.length} parts to check · layers on — ${names}.`);
}

/** Point the camera (or the flat plate) at one part, whichever mode is open. */
function focusPartInView(partId) {
  if (state.mode === '2d' && plate) {
    const drawn = plate.plate && plate.plate.regions.some((r) => r.partId === partId);
    if (!drawn) {
      flashStatus('That part is not drawn on this plate — switch the layer on, or use the interactive overlay.');
      return false;
    }
    plate.setSelected(partId);
    plate.zoomToPart(partId);
    return true;
  }
  if (viewer.focusParts?.([partId])) return true;
  if (viewer.focusPart?.(partId)) return true;
  if (viewer.human?.resolveMicroModel?.(partId) && state.level >= 4) enterMicro(partId);
  flashStatus('No 3D shape for that entry at this level — the description is still in the panel.');
  return false;
}

/* ==================================================================== */
/*  Details panel                                                      */
/* ==================================================================== */
function showPart(partId, { focus = false, from3d = false } = {}) {
  const part = PART_BY_ID[partId];
  if (!part) return;
  state.selectedPartId = partId;
  viewer.selectPart(partId);
  renderParts();
  renderDetails(part);
  // walk the regional tree to this part so the rail always says where it lives
  partTree?.reveal(partId);
  $('#rightPanel').hidden = false;
  // on a phone the details live in a sheet: bring it up when a part is picked
  if (mobile) mobile.revealDetails();

  if (state.mode === '2d') {
    // The interactive overlay is projected from the teaching mesh. In either
    // 2D mode, turn the requested layer on before showing/focusing its plate.
    const drawn = plate.plate && plate.plate.regions.some((r) => r.partId === partId);
    if (!drawn) {
      if (part.system !== 'micro' && !state.visible.has(part.system)) {
        state.visible.add(part.system);
        viewer.setSystems([...state.visible]);
        buildSystemList();
        renderParts();
      }
      renderPlate();
      if (focus) plate.zoomToPart(partId);
    } else {
      plate.setSelected(partId);
      if (focus) plate.zoomToPart(partId);
    }
    return;
  }

  const meshes = viewer.human.byPart.get(partId) || [];
  const visibleNow = meshes.filter((m) => viewer.isMeshVisible(m));
  const clinicalVisible = viewer.hasVisibleReferencePart?.(partId);
  if (focus) {
    if (visibleNow.length || clinicalVisible) viewer.focusPart(partId);
    else if (viewer.human.resolveMicroModel(partId) && state.level >= 4) enterMicro(partId);
  }
  if (from3d) {
    // keep the description and the model in sync, but do not yank the camera
  }
}

function renderDetails(part) {
  const sys = SYSTEM_BY_ID[part.system];
  const level = state.level;
  const tier = bestDetailFor(part, level);
  const tierLabel = TIERS.find((t) => t.key === tier)?.label || '';
  const body = part.details?.[tier] || part.details?.basic || '';
  const meshes = viewer.human.byPart.get(part.id) || [];
  const visibleNow = meshes.filter((m) => viewer.isMeshVisible(m));
  const clinicalVisible = viewer.hasVisibleReferencePart?.(part.id);
  const hasVisibleModel = visibleNow.length || clinicalVisible;
  const micro = viewer.human.resolveMicroModel(part.id);
  const locked = (part.minLevel ?? 1) > level;

  const tiersHtml = TIERS.map((t) => {
    const text = part.details?.[t.key];
    const unlocked = level >= t.min;
    if (!text) return '';
    return `<div class="d-tier ${t.key === tier ? 'current' : ''}">
      <div class="d-tier-head">${t.label}${unlocked ? '' : ' 🔒'}</div>
      <p class="d-tier-text">${unlocked ? text : '<i>Unlocks at ' + LEVEL_BY_ID[t.min].short + '.</i>'}</p>
    </div>`;
  }).join('');

  const facts = (part.facts || []).length
    ? `<div class="d-section"><h4>Quick facts</h4><ul class="d-facts">${part.facts.map((f) => `<li>${f}</li>`).join('')}</ul></div>`
    : '';

  const related = partsForSystem(part.system).filter((p) => p.id !== part.id).slice(0, 8);
  const relatedHtml = related.length
    ? `<div class="d-section"><h4>Also in the ${sys.name}</h4>
        <div style="display:flex;flex-wrap:wrap;gap:6px;">
        ${related.map((p) => `<button class="chip" data-goto="${p.id}">${p.name}</button>`).join('')}
        </div></div>`
    : '';

  // the rest of the branch this part sits in — the "check it part by part" trail
  const trail = pathToPart(part.id);
  const leafNode = trail[trail.length - 1];
  const siblings = leafNode
    ? partIdsUnder(leafNode.id)
      .map((id) => PART_BY_ID[id])
      .filter((p) => p && p.id !== part.id)
    : [];
  const trailHtml = trail.length
    ? `<div class="d-trail"><span aria-hidden="true">🌳</span>${trail
        .map((n, i) => `${i ? '<span class="sep" aria-hidden="true">›</span>' : ''}<button data-trail="${n.id}" title="Study just this branch: ${n.name}">${n.name}</button>`)
        .join('')}</div>`
    : '';
  const branchHtml = siblings.length
    ? `<div class="d-section"><h4>Next to check in ${leafNode.name}</h4>
        <div style="display:flex;flex-wrap:wrap;gap:6px;">
        ${siblings.map((p) => `<button class="chip${(p.minLevel ?? 1) > level ? ' dim' : ''}" data-goto="${p.id}">${p.name}${(p.minLevel ?? 1) > level ? ' 🔒' : ''}</button>`).join('')}
        </div></div>`
    : '';

  const actions = [];
  if (hasVisibleModel) actions.push(`<button class="btn primary" data-action="focus">🎯 Zoom to it</button>`);
  actions.push(`<button class="btn" data-action="isolate">🫧 Isolate ${sys.name}</button>`);
  if (micro) actions.push(`<button class="btn" data-action="micro" ${state.level >= 4 ? '' : 'disabled title="Available from Undergraduate level"'}>🔬 Micro view</button>`);
  actions.push(`<button class="btn" data-action="quiz">🎯 Quiz me on this</button>`);
  if (leafNode) actions.push(`<button class="btn" data-action="branch" title="Light up only the layers ${leafNode.name} needs, and frame it">🛠 Only ${leafNode.name}</button>`);

  const note = locked
    ? `<div class="d-note">🔒 This structure appears in the 3D model from <b>${LEVEL_BY_ID[part.minLevel].short}</b> onwards. You can still read about it below.</div>`
    : !hasVisibleModel && !micro
    ? `<div class="d-note">This entry is a concept or process rather than a single 3D shape — it is described in the text and appears in quiz and tour modes.</div>`
    : clinicalVisible
    ? `<div class="d-note clinical-note">✦ Shown with source-derived clinical 3D geometry. The cyan outline marks the selected structure.</div>`
    : '';

  $('#details').innerHTML = `
    <span class="d-sys" style="color:${sys.color};border-color:${sys.color}55">${sys.icon || ''} ${sys.name}</span>
    <h1 class="d-title">${part.name}<span class="d-level-pill">${tierLabel}</span></h1>
    ${part.latin ? `<p class="d-latin">${part.latin}</p>` : ''}
    ${trailHtml}
    <p class="d-body">${body}</p>
    <div class="d-actions">${actions.join('')}</div>
    ${note}
    ${facts}
    ${branchHtml}
    <div class="d-section"><h4><span class="caret">▾</span> Every level of detail</h4>
      <div class="d-content">${tiersHtml}</div>
    </div>
    ${relatedHtml}
  `;

  $('#details').querySelectorAll('[data-goto]').forEach((b) => {
    b.onclick = () => showPart(b.dataset.goto, { focus: true });
  });
  $('#details').querySelectorAll('[data-trail]').forEach((b) => {
    b.onclick = () => {
      setBrowse('tree');
      partTree?.reveal(part.id);
      showTreeNode(b.dataset.trail);
    };
  });
  $('#details').querySelectorAll('[data-action]').forEach((b) => {
    b.onclick = () => {
      const a = b.dataset.action;
      if (a === 'focus') viewer.focusPart(part.id);
      if (a === 'isolate') {
        viewer.setIsolate(part.system);
        state.visible = new Set([part.system]);
        buildSystemList();
        renderParts();
      }
      if (a === 'micro') enterMicro(part.id);
      if (a === 'quiz') openQuiz({ systemId: part.system, focusPart: part });
      if (a === 'branch' && leafNode) {
        setBrowse('tree');
        for (const n of trail) partTree?.setOpen(n.id, true);
        showTreeNode(leafNode.id);
        partTree?.reveal(part.id);
      }
    };
  });
  $('#details').querySelectorAll('h4').forEach((h) => {
    h.onclick = () => h.parentElement.classList.toggle('collapsed');
  });
}

function enterMicro(partId) {
  if (state.mode === '2d') setMode('3d'); // cells live in the 3D world
  const ok = viewer.enterMicro(partId);
  if (ok) {
    $('#rightPanel').hidden = false;
    flashStatus('Micro view — drag to rotate. Close it by picking another part or pressing Reset view.');
  } else {
    flashStatus('No microscopic model for this part yet — its detail is in the text.');
  }
}

/* ==================================================================== */
/*  Hover                                                               */
/* ==================================================================== */
function handleHover(info) {
  if (!info || !info.part) {
    hoverEl.hidden = true;
    $('#scene').classList.remove('hovering');
    return;
  }
  $('#scene').classList.add('hovering');
  let x;
  let y;
  if (info.screen) {
    x = info.screen.x;
    y = info.screen.y;
  } else if (info.point && viewer.camera) {
    const p = info.point.clone().project(viewer.camera);
    const rect = viewer.canvas.getBoundingClientRect();
    x = (p.x * 0.5 + 0.5) * rect.width;
    y = (-p.y * 0.5 + 0.5) * rect.height;
  } else return;
  hoverEl.hidden = false;
  hoverEl.style.left = `${x}px`;
  hoverEl.style.top = `${y}px`;
  hoverEl.innerHTML = `${info.part.name}<small>${SYSTEM_BY_ID[info.part.system].name} · click to study</small>`;
}

/* ==================================================================== */
/*  Search                                                              */
/* ==================================================================== */
function wireSearch() {
  const input = $('#search');
  const box = $('#searchResults');
  let sel = 0;
  let results = [];

  const close = () => { box.hidden = true; results = []; };

  input.addEventListener('input', () => {
    const q = input.value.trim();
    if (!q) return close();
    results = searchParts(q, state.level).slice(0, 40);
    if (!results.length) {
      box.innerHTML = `<div class="sr-item" style="color:var(--text-mute)">No match — try “heart”, “femur”, “nephron”…</div>`;
      box.hidden = false;
      return;
    }
    sel = 0;
    box.innerHTML = results
      .map((p, i) => `<div class="sr-item ${i === 0 ? 'sel' : ''}" data-id="${p.id}">
          <span style="color:${SYSTEM_BY_ID[p.system].color}">•</span>
          <span>${p.name}</span>
          <span class="sr-sys">${SYSTEM_BY_ID[p.system].name}</span>
        </div>`)
      .join('');
    box.hidden = false;
    box.querySelectorAll('.sr-item').forEach((el) => {
      el.onclick = () => {
        showPart(el.dataset.id, { focus: true });
        input.value = '';
        close();
      };
    });
  });

  input.addEventListener('keydown', (e) => {
    if (box.hidden || !results.length) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + results.length) % results.length;
      box.querySelectorAll('.sr-item').forEach((el, i) => el.classList.toggle('sel', i === sel));
      box.querySelectorAll('.sr-item')[sel]?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      showPart(results[sel].id, { focus: true });
      input.value = '';
      close();
    } else if (e.key === 'Escape') {
      close();
      input.blur();
    }
  });

  document.addEventListener('click', (e) => {
    if (!box.hidden && !e.target.closest('.search-wrap')) close();
  });
}

/* ==================================================================== */
/*  Quiz                                                                */
/* ==================================================================== */
function openQuiz({ systemId = null, focusPart = null, nodeId = null } = {}) {
  const modal = $('#quizModal');
  const body = $('#quizBody');
  modal.hidden = false;
  // a tree node narrows the pool to that region or branch; a system does the same
  const partIds = nodeId ? partIdsUnder(nodeId) : null;
  let qs = makeQuestions({ level: state.level, systemId, partIds, count: 8 });
  if (focusPart) {
    const first = makeQuestions({ level: state.level, systemId: focusPart.system, partIds, count: 12 });
    const mine = first.filter((q) => q.part.id === focusPart.id);
    qs = [...mine, ...first.filter((q) => q.part.id !== focusPart.id)].slice(0, 8);
  }
  const scope = nodeId ? nodeTitle(nodeId) : systemId ? SYSTEM_BY_ID[systemId]?.name : null;
  state.quiz = { qs, i: 0, score: 0, answered: false, scope };
  renderQuiz();
}

function renderQuiz() {
  const body = $('#quizBody');
  const q = state.quiz;
  if (!q) return;
  if (q.i >= q.qs.length) {
    const pct = Math.round((q.score / q.qs.length) * 100);
    const grade = pct >= 90 ? 'Outstanding — PhD material!' : pct >= 70 ? 'Great work!' : pct >= 50 ? 'Good start — review and try again.' : 'Keep exploring the body and try again.';
    body.innerHTML = `
      <div class="quiz-head"><h3>Quiz complete</h3><span class="quiz-score">${q.score}/${q.qs.length}</span></div>
      <p class="quiz-q">You scored <b>${pct}%</b>. ${grade}</p>
      <div class="quiz-actions">
        <button class="btn primary" id="qAgain">Try another set</button>
        <button class="btn" id="qClose">Close</button>
      </div>`;
    body.querySelector('#qAgain').onclick = () => openQuiz({});
    body.querySelector('#qClose').onclick = () => ($('#quizModal').hidden = true);
    return;
  }
  const cur = q.qs[q.i];
  body.innerHTML = `
    <div class="quiz-head">
      <h3>Quiz · ${LEVEL_BY_ID[state.level].short}${q.scope ? ` · ${q.scope}` : ''}</h3>
      <span class="quiz-score">Question ${q.i + 1}/${q.qs.length} · Score ${q.score}</span>
    </div>
    <div class="quiz-q"><span class="q-kind">${cur.kind === 'system' ? 'Which system?' : cur.kind === 'latin' ? 'Latin name' : 'Who am I?'}</span>${cur.prompt}</div>
    <div class="quiz-options">
      ${cur.options.map((o, i) => `<button class="quiz-opt" data-i="${i}">${o}</button>`).join('')}
    </div>
    <div class="quiz-feedback" id="qFeedback" hidden></div>
    <div class="quiz-actions">
      <button class="btn primary" id="qNext" hidden>Next ›</button>
      <button class="btn ghost" id="qShow" hidden>Study this part</button>
      <button class="btn ghost" id="qClose2">Close quiz</button>
    </div>`;

  body.querySelectorAll('.quiz-opt').forEach((btn) => {
    btn.onclick = () => {
      if (q.answered) return;
      q.answered = true;
      const idx = Number(btn.dataset.i);
      const correct = idx === cur.answer;
      if (correct) q.score++;
      body.querySelectorAll('.quiz-opt').forEach((b, i) => {
        if (i === cur.answer) b.classList.add('correct');
        else if (i === idx) b.classList.add('wrong');
        b.disabled = true;
      });
      const fb = body.querySelector('#qFeedback');
      fb.hidden = false;
      const tier = bestDetailFor(cur.part, state.level);
      fb.innerHTML = `${correct ? '✅ Correct!' : `❌ It was <b>${cur.part.name}</b>.`}
        <br><span style="color:var(--text-dim)">${(cur.part.details?.[tier] || '').split(/(?<=\.)\s+/)[0]}</span>`;
      body.querySelector('#qNext').hidden = false;
      body.querySelector('#qShow').hidden = false;
    };
  });
  body.querySelector('#qNext').onclick = () => { q.i++; q.answered = false; renderQuiz(); };
  body.querySelector('#qShow').onclick = () => { $('#quizModal').hidden = true; showPart(cur.part.id, { focus: true }); };
  body.querySelector('#qClose2').onclick = () => ($('#quizModal').hidden = true);
}

/* ==================================================================== */
/*  Tour                                                                */
/* ==================================================================== */
/** The plate has no top/bottom view — keep the tour readable in 2D. */
function plateHasView(view) {
  return ['front', 'back', 'left', 'right'].includes(view);
}

function openTour() {
  const tour = TOURS[state.level];
  if (!tour) return;
  state.tour = tour;
  state.tourStep = 0;
  $('#tourModal').hidden = false;
  renderTour();
}

function renderTour() {
  const tour = state.tour;
  const step = tour.steps[state.tourStep];
  $('#tourStepLabel').textContent = tour.title;
  $('#tourTitle').textContent = step.title;
  $('#tourText').textContent = step.text;
  $('#tourProgress').textContent = `${state.tourStep + 1} / ${tour.steps.length}`;
  $('#tourPrev').disabled = state.tourStep === 0;
  $('#tourNext').textContent = state.tourStep === tour.steps.length - 1 ? 'Finish' : 'Next ›';

  if (step.systems) {
    state.visible = new Set(step.systems);
    viewer.setSystems(step.systems);
    buildSystemList();
    renderParts();
    renderPlate(); // the 2D plate follows the tour too, layer by layer
  }
  if (step.view) {
    if (state.mode === '2d' && !plateHasView(step.view)) step.view = 'front';
    state.view = step.view;
    viewer.setView(step.view);
  }
  if (step.partId) {
    if (step.micro && state.level >= 4) {
      setTimeout(() => enterMicro(step.partId), 350);
    } else if (viewer.microMode) {
      viewer.exitMicro();
      setTimeout(() => showPart(step.partId, { focus: true }), 380);
    } else {
      setTimeout(() => showPart(step.partId, { focus: true }), 200);
    }
  }
  $$('.tool-group [data-view]').forEach((b) => b.classList.toggle('active', b.dataset.view === step.view));
}

/* ==================================================================== */
/*  Misc UI                                                             */
/* ==================================================================== */
let statusTimer = null;
function flashStatus(msg) {
  $('#statusText').textContent = msg;
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => {
    $('#statusText').textContent = 'Click any part of the body to learn about it.';
  }, 6000);
}

function updateStatus() {
  $('#statCounts').textContent = `${ATLAS_STATS.parts} parts · ${ATLAS_STATS.systems} systems · ${TREE_REGIONS.length} regions · ${LEVEL_BY_ID[state.level].short}`;
}

/** Small, non-intrusive provenance indicator for progressive clinical 3D. */
function updateClinicalBadge() {
  const badge = $('#clinicalBadge');
  const statuses = viewer?.clinical?.states;
  if (!badge || !statuses) return;
  const ready = [...statuses.values()].filter((s) => s === 'ready').length;
  const loading = [...statuses.values()].filter((s) => s === 'loading' || s === 'queued').length;
  const failed = [...statuses.values()].filter((s) => s === 'failed').length;
  badge.hidden = false;
  badge.classList.toggle('loading', loading > 0);
  badge.classList.toggle('ready', ready > 0);
  badge.classList.toggle('failed', failed > 0 && ready === 0);
  if (ready) {
    badge.textContent = `✦ Clinical 3D · ${ready} layer${ready === 1 ? '' : 's'} live${loading ? ' · loading…' : ''}`;
    badge.title = 'Source-derived anatomical geometry is replacing the lightweight teaching fallback for the enabled layers.';
  } else if (loading) {
    badge.textContent = '◌ Clinical 3D loading…';
    badge.title = 'Loading bundled anatomical source geometry; the app remains usable with its fallback model.';
  } else if (failed) {
    badge.textContent = '◇ Teaching model fallback';
    badge.title = 'A clinical source asset could not load, so the lightweight teaching model remains visible.';
  } else {
    badge.hidden = true;
  }
}

function wireUI() {
  // toolbar: views (drive both the camera and the plate)
  $$('#viewGroup [data-view]').forEach((b) => {
    b.onclick = () => {
      state.view = b.dataset.view;
      if (viewer.microMode) viewer.exitMicro();
      if (state.mode === '2d') {
        if (state.view === 'top') state.view = 'front'; // the plate has no top view
        plate.resetView();
        renderPlate();
      } else {
        viewer.setView(b.dataset.view);
      }
      $$('#viewGroup [data-view]').forEach((x) => x.classList.toggle('active', x.dataset.view === state.view));
    };
  });
  $$('#toolbar [data-focus]').forEach((b) => {
    b.onclick = () => {
      const f = b.dataset.focus;
      if (f === 'reset') {
        viewer.exitMicro();
        viewer.resetView();
        if (plate) plate.resetView();
      } else if (f === 'head' || f === 'torso' || f === 'legs') {
        if (state.mode === '2d') {
          plate.zoomToPart(f === 'head' ? 'head' : f === 'torso' ? 'chest' : 'thigh');
          renderPlate();
        } else viewer.setView(f);
      } else viewer.setView(f);
    };
  });

  // 3D ↔ 2D and the plate tools
  $$('#modeSwitch .mode-btn').forEach((b) => {
    b.onclick = () => setMode(b.dataset.mode);
  });
  $('#btnPlateStyle').onclick = () => togglePlateStyle();
  $('#btnPlateLabels').onclick = () => togglePlateLabels();
  $('#btnPlateFit').onclick = () => {
    plate.resetView();
    flashStatus('Plate fitted to the window.');
  };
  $('#btnPlateSVG').onclick = () => savePlate('svg');
  $('#btnPlatePNG').onclick = () => savePlate('png');

  $('#btnXray').onclick = (e) => {
    state.xray = !state.xray;
    viewer.setXray(state.xray);
    e.currentTarget.classList.toggle('active', state.xray);
    renderPlate();
    flashStatus(state.xray ? 'X-ray on: the skin is now see-through.' : 'X-ray off.');
  };
  $('#btnRotate').onclick = (e) => {
    state.spin = !state.spin;
    viewer.setAutoRotate(state.spin);
    e.currentTarget.classList.toggle('active', state.spin);
  };
  $('#btnClip').onclick = (e) => {
    state.clip = !state.clip;
    $('#sliceGroup').hidden = !state.clip;
    viewer.setClipping(state.clip, Number($('#clipRange').value), $('#clipAxis').value);
    e.currentTarget.classList.toggle('active', state.clip);
    flashStatus(state.clip ? 'Slice mode: move the slider to cut through the body.' : 'Slice off.');
  };
  $('#clipRange').oninput = (e) => viewer.setClipping(true, Number(e.target.value), $('#clipAxis').value);
  $('#clipAxis').onchange = (e) => viewer.setClipping(true, Number($('#clipRange').value), e.target.value);

  // panels
  $('#btnAllSystems').onclick = () => {
    state.visible = new Set((LEVEL_SYSTEMS[state.level] || SYSTEMS.map((s) => s.id)));
    state.activeSystem = null;
    state.treeNode = null;
    viewer.setSystems([...state.visible]);
    buildSystemList();
    renderParts();
    renderPlate();
  };
  $('#partsTitle').onclick = () => {
    // in the tree this means "back to the whole body", in the list "every system"
    state.activeSystem = null;
    state.treeNode = null;
    if (state.browse === 'tree' && $('#treeFilter').value) {
      $('#treeFilter').value = '';
      partTree?.setFilter('');
    }
    buildSystemList();
    renderParts();
    renderPlate();
  };
  $('#partsTitle').style.cursor = 'pointer';
  $('#btnNoSystems').onclick = () => {
    state.visible = new Set();
    state.treeNode = null;
    viewer.setSystems([]);
    buildSystemList();
    renderParts();
    renderPlate();
  };

  // the body-part tree: browse the atlas a part at a time
  $$('#browseSwitch .seg-btn').forEach((b) => {
    b.onclick = () => setBrowse(b.dataset.browse);
  });
  let treeFilterTimer = null;
  $('#treeFilter').oninput = (e) => {
    clearTimeout(treeFilterTimer);
    const value = e.target.value;
    treeFilterTimer = setTimeout(() => partTree?.setFilter(value), 120);
  };
  $('#treeFilter').onkeydown = (e) => {
    if (e.key === 'Enter') {
      clearTimeout(treeFilterTimer);
      partTree?.setFilter(e.target.value);
      const first = $('#partTree').querySelector('.tree-row.part');
      if (first) showPart(first.dataset.part, { focus: true });
    }
    if (e.key === 'Escape') { e.target.value = ''; partTree?.setFilter(''); }
  };
  $('#btnTreeExpand').onclick = () => partTree?.expandAll();
  $('#btnTreeCollapse').onclick = () => partTree?.collapseAll();
  $('#btnTreeReveal').onclick = () => {
    if (!state.selectedPartId) return flashStatus('Open a part first — then 📍 shows where it sits in the tree.');
    setBrowse('tree');
    partTree?.reveal(state.selectedPartId);
    flashStatus(`${PART_BY_ID[state.selectedPartId].name} — ${trailLabel(state.selectedPartId)}.`);
  };
  $('#btnCloseDetails').onclick = () => {
    if (mobile) mobile.close();
    $('#rightPanel').hidden = true;
    viewer.selectPart(null);
    if (plate) plate.setSelected(null);
    state.selectedPartId = null;
    renderParts();
  };

  // search
  wireSearch();

  // quiz / tour / help
  $('#btnQuiz').onclick = () => openQuiz({ systemId: state.activeSystem });
  $('#btnTour').onclick = () => openTour();
  $('#btnHelp').onclick = () => ($('#helpModal').hidden = false);
  $('#btnCloseHelp').onclick = () => ($('#helpModal').hidden = true);
  $('#btnCloseQuiz').onclick = () => ($('#quizModal').hidden = true);

  $('#tourPrev').onclick = () => { if (state.tourStep > 0) { state.tourStep--; renderTour(); } };
  $('#tourNext').onclick = () => {
    if (state.tourStep < state.tour.steps.length - 1) { state.tourStep++; renderTour(); }
    else { $('#tourModal').hidden = true; viewer.exitMicro(); flashStatus('Tour finished — now explore on your own!'); }
  };
  $('#btnCloseTour').onclick = () => { $('#tourModal').hidden = true; viewer.exitMicro(); };

  // modals: click outside
  ['#quizModal', '#helpModal'].forEach((sel) => {
    $(sel).addEventListener('click', (e) => { if (e.target === $(sel)) $(sel).hidden = true; });
  });

  // keyboard
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    if (e.key >= '1' && e.key <= '5') setLevel(Number(e.key));
    if (e.key === '/') { e.preventDefault(); $('#search').focus(); }
    if (e.key.toLowerCase() === 'x') $('#btnXray').click();
    if (e.key.toLowerCase() === 'p') setMode(state.mode === '3d' ? '2d' : '3d');
    if (e.key.toLowerCase() === 't') setBrowse(state.browse === 'tree' ? 'list' : 'tree');
    if (e.key.toLowerCase() === 'l' && state.mode === '2d' && state.plateStyle === 'interactive') togglePlateLabels();
    if (e.key.toLowerCase() === 'r') { viewer.exitMicro(); viewer.resetView(); }
    if (e.key === 'Escape') {
      if (mobile) mobile.close();
      $('#quizModal').hidden = true;
      $('#helpModal').hidden = true;
      $('#tourModal').hidden = true;
    }
  });
}

function openHelpIfFirstVisit() {
  try {
    if (!localStorage.getItem('hb3d-visited')) {
      $('#helpModal').hidden = false;
      localStorage.setItem('hb3d-visited', '1');
    }
  } catch { /* private mode: skip */ }
}

/* ==================================================================== */
/*  Graceful degradation when WebGL is unavailable                     */
/* ==================================================================== */
function createFallbackViewer(canvas) {
  const noop = () => {};
  // The 3D model itself needs no WebGL, so the atlas still knows which parts
  // have geometry and which have a microscopic model.
  let human = { byPart: new Map(), resolveMicroModel: () => null, systems: {}, allMeshes: [] };
  try {
    human = buildHumanoid('female');
  } catch (err) {
    console.error('model build failed:', err);
  }
  return {
    fallback: true,
    canvas,
    camera: { position: { clone: () => ({ clone: () => {} }) } },
    human,
    microMode: false,
    level: 1,
    isMeshVisible: () => false,
    resize: noop, applyLevel: noop, setSystems: noop, toggleSystem: () => true,
    setIsolate: noop, setOpacity: noop, setXray: noop, setClipping: noop,
    setAutoRotate: noop, focusPart: () => false, focusParts: () => false, focusSystem: noop, setView: noop,
    resetView: noop, selectPart: noop, enterMicro: () => false, exitMicro: noop,
    refreshVisibility: noop, setVariant: noop, setPaused: noop, setSkin: noop,
    isolateSystem: null,
  };
}

function showWebGLNotice() {
  $('#statusText').textContent =
    '⚠ 3D rendering (WebGL) is not available in this browser — the atlas text, search, quiz and tour still work.';
}

/* ==================================================================== */
boot();

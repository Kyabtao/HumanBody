import { Viewer } from './scene/viewer.js';
import { SYSTEMS, SYSTEM_BY_ID } from './data/systems.js';
import { LEVELS, LEVEL_BY_ID, bestDetailFor } from './data/levels.js';
import { ALL_PARTS, PART_BY_ID, ATLAS_STATS, partsForSystem, partsForLevel, searchParts } from './data/index.js';
import { makeQuestions } from './quiz.js';
import { buildHumanoid } from './scene/humanoid.js';
import { TOURS } from './data/tours.js';

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
};

let viewer = null;
let hoverEl = null;

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

  viewer.resize();
  window.addEventListener('resize', () => viewer.resize());

  buildLevelSwitch();
  buildSystemList();
  renderParts();
  wireUI();
  updateStatus();
  openHelpIfFirstVisit();

  requestAnimationFrame(() => {
    $('#loading').classList.add('hidden');
    setTimeout(() => $('#loading').remove(), 700);
  });
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
        state.variant = state.variant === 'female' ? 'male' : 'female';
        viewer.setVariant(state.variant);
        buildSystemList();
        renderParts();
        if (state.selectedPartId) showPart(state.selectedPartId, { focus: true });
        flashStatus(`Reproductive anatomy: ${state.variant === 'female' ? 'female' : 'male'}.`);
        return;
      }
      if (e.target.classList.contains('iso')) {
        viewer.setIsolate(sys.id);
        state.visible = new Set([sys.id]);
        buildSystemList();
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
}

/* ==================================================================== */
/*  Parts list                                                         */
/* ==================================================================== */
function renderParts() {
  const list = $('#partList');
  const sys = state.activeSystem ? SYSTEM_BY_ID[state.activeSystem] : null;
  $('#partsTitle').textContent = sys ? sys.name : 'All parts';
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
  $('#rightPanel').hidden = false;

  const meshes = viewer.human.byPart.get(partId) || [];
  const visibleNow = meshes.filter((m) => viewer.isMeshVisible(m));
  if (focus) {
    if (visibleNow.length) viewer.focusPart(partId);
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

  const actions = [];
  if (visibleNow.length) actions.push(`<button class="btn primary" data-action="focus">🎯 Zoom to it</button>`);
  actions.push(`<button class="btn" data-action="isolate">🫧 Isolate ${sys.name}</button>`);
  if (micro) actions.push(`<button class="btn" data-action="micro" ${state.level >= 4 ? '' : 'disabled title="Available from Undergraduate level"'}>🔬 Micro view</button>`);
  actions.push(`<button class="btn" data-action="quiz">🎯 Quiz me on this</button>`);

  const note = locked
    ? `<div class="d-note">🔒 This structure appears in the 3D model from <b>${LEVEL_BY_ID[part.minLevel].short}</b> onwards. You can still read about it below.</div>`
    : !visibleNow.length && !micro
    ? `<div class="d-note">This entry is a concept or process rather than a single 3D shape — it is described in the text and appears in quiz and tour modes.</div>`
    : '';

  $('#details').innerHTML = `
    <span class="d-sys" style="color:${sys.color};border-color:${sys.color}55">${sys.icon || ''} ${sys.name}</span>
    <h1 class="d-title">${part.name}<span class="d-level-pill">${tierLabel}</span></h1>
    ${part.latin ? `<p class="d-latin">${part.latin}</p>` : ''}
    <p class="d-body">${body}</p>
    <div class="d-actions">${actions.join('')}</div>
    ${note}
    ${facts}
    <div class="d-section"><h4><span class="caret">▾</span> Every level of detail</h4>
      <div class="d-content">${tiersHtml}</div>
    </div>
    ${relatedHtml}
  `;

  $('#details').querySelectorAll('[data-goto]').forEach((b) => {
    b.onclick = () => showPart(b.dataset.goto, { focus: true });
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
    };
  });
  $('#details').querySelectorAll('h4').forEach((h) => {
    h.onclick = () => h.parentElement.classList.toggle('collapsed');
  });
}

function enterMicro(partId) {
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
  const p = info.point.clone().project(viewer.camera);
  const rect = viewer.canvas.getBoundingClientRect();
  const x = (p.x * 0.5 + 0.5) * rect.width;
  const y = (-p.y * 0.5 + 0.5) * rect.height;
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
function openQuiz({ systemId = null, focusPart = null } = {}) {
  const modal = $('#quizModal');
  const body = $('#quizBody');
  modal.hidden = false;
  let qs = makeQuestions({ level: state.level, systemId, count: 8 });
  if (focusPart) {
    const first = makeQuestions({ level: state.level, systemId: focusPart.system, count: 12 });
    const mine = first.filter((q) => q.part.id === focusPart.id);
    qs = [...mine, ...first.filter((q) => q.part.id !== focusPart.id)].slice(0, 8);
  }
  state.quiz = { qs, i: 0, score: 0, answered: false };
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
      <h3>Quiz · ${LEVEL_BY_ID[state.level].short}</h3>
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
  }
  if (step.view) viewer.setView(step.view);
  if (step.partId) {
    if (step.micro && state.level >= 4) {
      setTimeout(() => viewer.enterMicro(step.partId), 350);
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
  $('#statCounts').textContent = `${ATLAS_STATS.parts} parts · ${ATLAS_STATS.systems} systems · ${LEVEL_BY_ID[state.level].short}`;
}

function wireUI() {
  // toolbar: views
  $$('#viewGroup [data-view]').forEach((b) => {
    b.onclick = () => {
      if (viewer.microMode) viewer.exitMicro();
      viewer.setView(b.dataset.view);
      $$('#viewGroup [data-view]').forEach((x) => x.classList.toggle('active', x === b));
    };
  });
  $$('#toolbar [data-focus]').forEach((b) => {
    b.onclick = () => {
      const f = b.dataset.focus;
      if (f === 'reset') { viewer.exitMicro(); viewer.resetView(); }
      else viewer.setView(f);
    };
  });

  $('#btnXray').onclick = (e) => {
    state.xray = !state.xray;
    viewer.setXray(state.xray);
    e.currentTarget.classList.toggle('active', state.xray);
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
    viewer.setSystems([...state.visible]);
    buildSystemList();
    renderParts();
  };
  $('#partsTitle').onclick = () => {
    state.activeSystem = null;
    buildSystemList();
    renderParts();
  };
  $('#partsTitle').style.cursor = 'pointer';
  $('#btnNoSystems').onclick = () => {
    state.visible = new Set();
    viewer.setSystems([]);
    buildSystemList();
    renderParts();
  };
  $('#btnCloseDetails').onclick = () => {
    $('#rightPanel').hidden = true;
    viewer.selectPart(null);
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
    if (e.key.toLowerCase() === 'r') { viewer.exitMicro(); viewer.resetView(); }
    if (e.key === 'Escape') {
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
    setAutoRotate: noop, focusPart: () => false, focusSystem: noop, setView: noop,
    resetView: noop, selectPart: noop, enterMicro: () => false, exitMicro: noop,
    refreshVisibility: noop, setVariant: noop,
  };
}

function showWebGLNotice() {
  $('#statusText').textContent =
    '⚠ 3D rendering (WebGL) is not available in this browser — the atlas text, search, quiz and tour still work.';
}

/* ==================================================================== */
boot();

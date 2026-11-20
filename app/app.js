// Leonida Case File — bootstrap: loads the trophy list and the operation
// plan, wires the evidence log, the field report, the filter desk and the
// spoiler setting, and reads the page state from the URL hash so any view
// can be linked to.
import { loadEarned, saveEarned, exportEarned, importEarnedFile } from './store.js';
import { KIND_LABELS, KIND_FILTERS, renderTrophyList } from './list.js';
import { renderTrophyDetail } from './detail.js';
import { renderRoadmap, renderMissables } from './roadmap.js';

const state = {
  earned: loadEarned(),
  kindFilter: 'all',
  gradeFilter: 'all',
  query: '',
  spoilersOn: true,
  selectedId: null,
};

let trophies = [];
let trophiesById = new Map();
let roadmap = null;

const listEl = document.getElementById('trophyList');
const detailEl = document.getElementById('detail');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('gradeFilter');
const spoilerEl = document.getElementById('spoilerToggle');
const chipsEl = document.getElementById('kindChips');

function readHash() {
  const raw = location.hash.replace(/^#/, '');
  const pairs = new Map();
  for (const part of raw.split('&')) {
    const [key, value] = part.split('=');
    if (key) pairs.set(decodeURIComponent(key), value === undefined ? '' : decodeURIComponent(value));
  }
  return pairs;
}

function applyHash() {
  const hash = readHash();
  if (hash.has('kind') && KIND_FILTERS.includes(hash.get('kind'))) state.kindFilter = hash.get('kind');
  if (hash.has('grade') && ['all', 'platinum', 'gold', 'silver', 'bronze'].includes(hash.get('grade'))) state.gradeFilter = hash.get('grade');
  if (hash.has('spoilers')) state.spoilersOn = hash.get('spoilers') !== 'off';
  if (hash.has('q')) state.query = hash.get('q');
  if (hash.has('trophy')) {
    const id = Number(hash.get('trophy'));
    if (trophiesById.has(id)) state.selectedId = id;
  }
}

function renderProgress() {
  const total = trophies.length;
  const count = state.earned.size;
  document.getElementById('progressText').textContent = `${count} of ${total} earned`;
  document.getElementById('progressFill').style.width = total === 0 ? '0%' : `${Math.round((count / total) * 100)}%`;
  const byGrade = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const trophy of trophies) if (state.earned.has(trophy.name)) byGrade[trophy.grade] += 1;
  document.getElementById('progressGrades').textContent =
    `Platinum ${byGrade.platinum}/1 · Gold ${byGrade.gold}/2 · Silver ${byGrade.silver}/6 · Bronze ${byGrade.bronze}/46`;
}

function renderChips() {
  chipsEl.replaceChildren();
  for (const kind of KIND_FILTERS) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.textContent = kind === 'all' ? 'All trophies' : KIND_LABELS[kind];
    chip.setAttribute('aria-pressed', String(state.kindFilter === kind));
    chip.addEventListener('click', () => {
      state.kindFilter = kind;
      renderAll();
    });
    chipsEl.append(chip);
  }
}

function renderAll() {
  renderProgress();
  renderChips();
  searchEl.value = state.query;
  gradeEl.value = state.gradeFilter;
  spoilerEl.checked = state.spoilersOn;
  const shown = renderTrophyList(listEl, trophies, state, toggleEarned, selectTrophy);
  document.getElementById('listCount').textContent = `— showing ${shown} of ${trophies.length}`;
  renderTrophyDetail(detailEl, trophiesById.get(state.selectedId) ?? null, state);
}

function toggleEarned(trophy) {
  if (state.earned.has(trophy.name)) state.earned.delete(trophy.name);
  else state.earned.add(trophy.name);
  saveEarned(state.earned);
  renderAll();
}

function selectTrophy(trophy) {
  state.selectedId = trophy.id;
  history.replaceState(null, '', `#trophy=${trophy.id}`);
  renderAll();
  detailEl.scrollIntoView({ block: 'nearest' });
}

async function loadData() {
  const [trophyDoc, roadmapDoc] = await Promise.all([
    (await fetch('data/trophies.json')).json(),
    (await fetch('data/roadmap.json')).json(),
  ]);
  trophies = [...trophyDoc.trophies].sort((a, b) => a.id - b.id);
  trophiesById = new Map(trophies.map((t) => [t.id, t]));
  roadmap = roadmapDoc;
}

async function boot() {
  await loadData();
  applyHash();
  renderAll();
  renderRoadmap(document.getElementById('roadmap'), roadmap, trophiesById, selectTrophy);
  renderMissables(document.getElementById('missables'), roadmap, trophiesById, selectTrophy);

  // Deep links scroll only once the whole page is rendered, so the target
  // is at its final position: a trophy link opens its field report, a view
  // link shows that section.
  const hash = readHash();
  if (state.selectedId) {
    detailEl.scrollIntoView();
  } else if (hash.get('view') === 'roadmap') {
    document.getElementById('roadmap').scrollIntoView();
  } else if (hash.get('view') === 'missables') {
    document.getElementById('missables').scrollIntoView();
  }

  searchEl.addEventListener('input', () => {
    state.query = searchEl.value.trim().toLowerCase();
    renderAll();
  });
  gradeEl.addEventListener('change', () => {
    state.gradeFilter = gradeEl.value;
    renderAll();
  });
  spoilerEl.addEventListener('change', () => {
    state.spoilersOn = spoilerEl.checked;
    renderAll();
  });
  document.getElementById('exportBtn').addEventListener('click', () => {
    exportEarned(state.earned, trophies.length);
  });
  document.getElementById('importFile').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      state.earned = await importEarnedFile(file, trophies.map((t) => t.name));
      saveEarned(state.earned);
      renderAll();
    } catch (error) {
      alert(error.message);
    }
    event.target.value = '';
  });
  document.getElementById('resetProgress').addEventListener('click', () => {
    if (confirm('Clear all earned trophies? This cannot be undone.')) {
      state.earned = new Set();
      saveEarned(state.earned);
      renderAll();
    }
  });
  window.addEventListener('hashchange', () => {
    applyHash();
    renderAll();
  });
}

boot();

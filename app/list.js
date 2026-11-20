// The trophy checklist: one card per trophy, with filters, search and the
// spoiler setting that hides story trophies until they are earned.
export const KIND_LABELS = {
  story: 'Story',
  side: 'Side quests',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  robbery: 'Robberies',
  exploration: 'Exploration',
  misc: 'Misc',
};

export const KIND_FILTERS = ['all', 'story', 'side', 'missable', 'collectibles', 'activities', 'robbery', 'exploration'];

export function gradeBadge(grade) {
  const badge = document.createElement('span');
  badge.className = `badge ${grade}`;
  badge.textContent = grade;
  return badge;
}

export function isSpoilerHidden(trophy, spoilersOn, earned) {
  return spoilersOn && trophy.kind === 'story' && !earned.has(trophy.name);
}

export function trophyMatches(trophy, kindFilter, gradeFilter, query) {
  if (gradeFilter !== 'all' && trophy.grade !== gradeFilter) return false;
  if (kindFilter === 'missable') {
    if (!trophy.missable) return false;
  } else if (kindFilter !== 'all' && trophy.kind !== kindFilter) {
    return false;
  }
  if (query) {
    const haystack = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
    if (!haystack.includes(query)) return false;
  }
  return true;
}

export function buildTrophyCard(trophy, state, onToggle, onSelect) {
  const { earned, spoilersOn, selectedId } = state;
  const hidden = isSpoilerHidden(trophy, spoilersOn, earned);
  const card = document.createElement('article');
  card.className = 'card';
  if (earned.has(trophy.name)) card.classList.add('earned');
  if (selectedId === trophy.id) card.classList.add('selected');

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(trophy.name);
  box.setAttribute('aria-label', `Mark ${hidden ? 'story trophy' : trophy.name} as earned`);
  box.addEventListener('click', (event) => {
    event.stopPropagation();
    onToggle(trophy);
  });
  card.append(box);

  const body = document.createElement('div');
  const title = document.createElement('h3');
  title.textContent = hidden ? 'Hidden story trophy' : trophy.name;
  body.append(title);
  const desc = document.createElement('p');
  desc.className = 'desc';
  desc.textContent = hidden ? 'Earn this trophy to reveal its name and description.' : trophy.description;
  body.append(desc);
  if (!hidden && trophy.target) {
    const target = document.createElement('p');
    target.className = 'target';
    target.textContent = trophy.target;
    body.append(target);
  }
  card.append(body);

  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.append(gradeBadge(trophy.grade));
  if (trophy.missable) {
    const flag = document.createElement('span');
    flag.className = 'flag missable';
    flag.textContent = 'Missable';
    meta.append(flag);
  }
  if (trophy.hidden) {
    const flag = document.createElement('span');
    flag.className = 'flag hidden';
    flag.textContent = 'Hidden';
    meta.append(flag);
  }
  if (trophy.status === 'unconfirmed') {
    const flag = document.createElement('span');
    flag.className = 'flag unconfirmed';
    flag.textContent = 'Unconfirmed';
    meta.append(flag);
  }
  card.append(meta);

  card.addEventListener('click', () => onSelect(trophy));
  return card;
}

export function renderTrophyList(container, trophies, state, onToggle, onSelect) {
  container.replaceChildren();
  const shown = trophies.filter((t) => trophyMatches(t, state.kindFilter, state.gradeFilter, state.query));
  if (shown.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-list';
    empty.textContent = 'No trophies match those filters. Clear the search or pick another kind.';
    container.append(empty);
  }
  for (const trophy of shown) container.append(buildTrophyCard(trophy, state, onToggle, onSelect));
  return shown.length;
}

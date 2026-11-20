// The trophy detail panel: the selected trophy's official description, its
// guide in our own words, and the public sources that guide cites.
import { gradeBadge, isSpoilerHidden, KIND_LABELS } from './list.js';

function sourceLink(source) {
  const item = document.createElement('li');
  const link = document.createElement('a');
  link.href = source.url;
  link.textContent = source.name;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  item.append(link);
  return item;
}

export function renderTrophyDetail(panel, trophy, state) {
  panel.replaceChildren();
  if (!trophy) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = 'Pick a trophy from the checklist to read its guide, where to go, how to do it, and what it cites.';
    panel.append(empty);
    return;
  }
  const { earned, spoilersOn } = state;
  const hidden = isSpoilerHidden(trophy, spoilersOn, earned);

  const heading = document.createElement('h2');
  heading.textContent = hidden ? 'Hidden story trophy' : trophy.name;
  panel.append(heading);

  const badges = document.createElement('div');
  badges.className = 'badges';
  badges.append(gradeBadge(trophy.grade));
  if (trophy.missable) {
    const flag = document.createElement('span');
    flag.className = 'flag missable';
    flag.textContent = 'Missable — do it before it locks';
    badges.append(flag);
  }
  if (trophy.status === 'unconfirmed') {
    const flag = document.createElement('span');
    flag.className = 'flag unconfirmed';
    flag.textContent = 'Method still being confirmed';
    badges.append(flag);
  }
  panel.append(badges);

  const official = document.createElement('p');
  official.className = 'official';
  official.textContent = hidden ? 'Official description hidden until earned.' : `“${trophy.description}” — official description`;
  panel.append(official);

  if (hidden) {
    const note = document.createElement('p');
    note.className = 'spoiler-note';
    note.textContent = 'Spoilers are hidden. Tick this trophy in the checklist once you earn it, or turn the spoiler setting off, to reveal its guide.';
    panel.append(note);
    return;
  }

  const kindLine = document.createElement('p');
  kindLine.className = 'meta-line';
  kindLine.textContent = `Kind: ${KIND_LABELS[trophy.kind] ?? trophy.kind} · Roadmap stage ${trophy.roadmap_stage}${trophy.target ? ` · ${trophy.target}` : ''}${earned.has(trophy.name) ? ' · Earned ✓' : ''}`;
  panel.append(kindLine);

  const guide = document.createElement('p');
  guide.className = 'guide';
  guide.textContent = trophy.guide;
  panel.append(guide);

  if (trophy.sources && trophy.sources.length > 0) {
    const block = document.createElement('div');
    block.className = 'sources';
    const title = document.createElement('h3');
    title.textContent = 'Sources';
    block.append(title);
    const list = document.createElement('ul');
    for (const source of trophy.sources) list.append(sourceLink(source));
    block.append(list);
    panel.append(block);
  }
}

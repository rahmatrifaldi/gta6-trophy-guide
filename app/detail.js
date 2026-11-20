// The field report: the selected trophy's official description, its guide
// in our own words, and the public sources on file that the guide cites —
// numbered, so a reader can check every specific claim against its source.
import { gradeStamp, isSpoilerHidden, KIND_LABELS } from './list.js';

function sourceEntry(source, index) {
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
    empty.textContent = 'Pick an entry from the evidence log to open its field report: where to go, how to do it, and the sources on file.';
    panel.append(empty);
    return;
  }
  const { earned, spoilersOn } = state;
  const hidden = isSpoilerHidden(trophy, spoilersOn, earned);

  const tag = document.createElement('p');
  tag.className = 'file-tag';
  tag.textContent = `Field report — exhibit Nº ${String(trophy.id).padStart(2, '0')} of 55`;
  panel.append(tag);

  const heading = document.createElement('h2');
  heading.textContent = hidden ? 'Hidden story trophy' : trophy.name;
  panel.append(heading);

  const badges = document.createElement('div');
  badges.className = 'badges';
  badges.append(gradeStamp(trophy.grade));
  if (trophy.missable) {
    const flag = document.createElement('span');
    flag.className = 'stamp-flag missable';
    flag.textContent = 'Missable — do it before it locks';
    badges.append(flag);
  }
  if (trophy.status === 'unconfirmed') {
    const flag = document.createElement('span');
    flag.className = 'stamp-flag unconfirmed';
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
    note.textContent = 'Spoilers are hidden. Tick this trophy in the evidence log once you earn it, or turn the spoiler setting off, to reveal its field report.';
    panel.append(note);
    return;
  }

  const kindLine = document.createElement('p');
  kindLine.className = 'meta-line';
  kindLine.textContent = `KIND: ${KIND_LABELS[trophy.kind] ?? trophy.kind} · PLAN STAGE ${trophy.roadmap_stage}${trophy.target ? ` · ${trophy.target}` : ''}${earned.has(trophy.name) ? ' · EARNED ✓' : ''}`;
  panel.append(kindLine);

  const guide = document.createElement('p');
  guide.className = 'guide';
  guide.textContent = trophy.guide;
  panel.append(guide);

  if (trophy.sources && trophy.sources.length > 0) {
    const block = document.createElement('div');
    block.className = 'sources';
    const title = document.createElement('h3');
    title.textContent = 'Sources on file';
    block.append(title);
    const list = document.createElement('ol');
    trophy.sources.forEach((source, index) => list.append(sourceEntry(source, index)));
    block.append(list);
    panel.append(block);
  }
}

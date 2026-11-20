// The roadmap to the platinum and the missable-trophy warnings, rendered
// from the roadmap data file and the trophy list.
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

export function renderRoadmap(section, roadmap, trophiesById, onSelectTrophy) {
  const title = document.getElementById('roadmapTitle');
  title.textContent = roadmap.title;
  const intro = document.getElementById('roadmapIntro');
  intro.textContent = roadmap.intro;
  const stages = document.getElementById('roadmapStages');
  stages.replaceChildren();
  for (const stage of roadmap.stages) {
    const card = document.createElement('div');
    card.className = 'stage';
    const heading = document.createElement('h3');
    heading.textContent = `Stage ${stage.stage} — ${stage.title}`;
    card.append(heading);
    const hours = document.createElement('p');
    hours.className = 'hours';
    hours.textContent = stage.hours;
    card.append(hours);
    const text = document.createElement('p');
    text.textContent = stage.text;
    card.append(text);
    const names = document.createElement('ul');
    names.className = 'trophy-names';
    for (const id of stage.trophy_ids) {
      const trophy = trophiesById.get(id);
      if (!trophy) continue;
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = `#trophy=${trophy.id}`;
      link.textContent = trophy.name;
      link.addEventListener('click', (event) => {
        event.preventDefault();
        onSelectTrophy(trophy);
      });
      item.append(link);
      names.append(item);
    }
    card.append(names);
    stages.append(card);
  }
  const sources = document.getElementById('roadmapSources');
  sources.replaceChildren();
  sources.append(document.createTextNode('Roadmap sources: '));
  for (const source of roadmap.sources ?? []) {
    sources.append(sourceLink(source));
    sources.append(document.createTextNode(' '));
  }
}

export function renderMissables(section, roadmap, trophiesById, onSelectTrophy) {
  const title = document.getElementById('missableTitle');
  title.textContent = roadmap.missable.title;
  const text = document.getElementById('missableText');
  text.textContent = roadmap.missable.text;
  const cards = document.getElementById('missableCards');
  cards.replaceChildren();
  for (const entry of roadmap.missable.entries) {
    const trophy = trophiesById.get(entry.trophy_id);
    if (!trophy) continue;
    const card = document.createElement('div');
    card.className = 'miss-card';
    const heading = document.createElement('h3');
    heading.textContent = `⚠ ${trophy.name} — the one trophy you can miss`;
    card.append(heading);
    const warning = document.createElement('p');
    warning.textContent = entry.warning;
    card.append(warning);
    const link = document.createElement('a');
    link.href = `#trophy=${trophy.id}`;
    link.textContent = 'Read its full guide';
    link.addEventListener('click', (event) => {
      event.preventDefault();
      onSelectTrophy(trophy);
    });
    card.append(link);
    cards.append(card);
  }
  const watch = document.getElementById('watchOuts');
  watch.replaceChildren();
  for (const line of roadmap.missable.watch_outs ?? []) {
    const item = document.createElement('li');
    item.textContent = line;
    watch.append(item);
  }
}

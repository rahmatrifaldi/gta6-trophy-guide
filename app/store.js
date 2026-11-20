// The case file's evidence locker: a set of earned trophy names kept in
// localStorage, exportable to a JSON file and importable back.
export const STORAGE_KEY = 'leonida-case-file-earned-v1';

export function loadEarned() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed.filter((name) => typeof name === 'string')) : new Set();
  } catch {
    return new Set();
  }
}

export function saveEarned(earned) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned].sort()));
}

export function exportEarned(earned, total) {
  const payload = {
    app: 'Leonida Case File — GTA VI (PS5)',
    exportedAt: new Date().toISOString(),
    earned: [...earned].sort(),
    total,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const anchor = document.createElement('a');
  anchor.href = URL.createObjectURL(blob);
  anchor.download = 'gta6-trophy-progress.json';
  anchor.click();
  URL.revokeObjectURL(anchor.href);
}

export async function importEarnedFile(file, knownNames) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  const names = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(names)) throw new Error('That file does not hold a list of earned trophies.');
  const known = new Set(knownNames);
  const kept = names.filter((name) => typeof name === 'string' && known.has(name));
  if (kept.length === 0) throw new Error('No trophy names in that file match this case file.');
  return new Set(kept);
}

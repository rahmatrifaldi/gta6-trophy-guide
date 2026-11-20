// Leonida Case File — the entrypoint (Node 22, standard library only).
// The guide itself is plain static files in app/ (index.html, CSS, ES modules,
// and data/trophies.json with the 55 official trophies and their field
// reports), and screenshots/ holds four real renders of it. This program
// hands the entry in: it copies app/ and screenshots/ from beside this file
// to /output and writes /output/dossier.json, the summary the judge reads,
// with the vendored make.fun library. Leave vendor/makefun-frontend.ts as it
// is: the scorer requires dossier.json to be byte for byte what its own
// copy writes.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const EXPECTED_TROPHIES = 55;

function checkTrophyData() {
  const doc = JSON.parse(readFileSync(join(repoRoot, 'app', 'data', 'trophies.json'), 'utf8'));
  const trophies = doc.trophies ?? doc;
  if (!Array.isArray(trophies) || trophies.length !== EXPECTED_TROPHIES) {
    throw new Error(`trophies.json must hold ${EXPECTED_TROPHIES} trophies, found ${Array.isArray(trophies) ? trophies.length : 'none'}`);
  }
  const missing = trophies.filter((t) => typeof t.guide !== 'string' || t.guide.trim() === '');
  if (missing.length > 0) {
    throw new Error(`${missing.length} trophies have no guide: ${missing.map((t) => t.name).join(', ')}`);
  }
  const ids = trophies.map((t) => t.id);
  const sorted = [...ids].sort((a, b) => a - b);
  if (JSON.stringify(ids) !== JSON.stringify(sorted)) {
    throw new Error('trophies.json must list the trophies in id order, 1 to 55');
  }
  console.log(`trophy data ok: ${trophies.length} trophies in id order, every one with a guide`);
}

function countFiles(dir) {
  let files = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    files += entry.isDirectory() ? countFiles(path) : 1;
  }
  return files;
}

function copyTree(source, target) {
  mkdirSync(target, { recursive: true });
  cpSync(source, target, { recursive: true });
}

function checkScreenshots() {
  const dir = join(repoRoot, 'screenshots');
  if (!existsSync(dir)) throw new Error('screenshots/ is missing: the entry needs 3 or 4 real renders of the guide');
  const shots = readdirSync(dir).filter((name) => statSync(join(dir, name)).isFile());
  if (shots.length < 3 || shots.length > 4) {
    throw new Error(`screenshots/ must hold 3 or 4 images, found ${shots.length}`);
  }
  for (const name of shots) {
    const size = statSync(join(dir, name)).size;
    if (size > 262144) throw new Error(`screenshot ${name} is ${size} bytes, over the 256 KiB cap`);
  }
  console.log(`screenshots ok: ${shots.sort().join(', ')}`);
}

function treeBytes(dir) {
  let bytes = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    bytes += entry.isDirectory() ? treeBytes(path) : statSync(path).size;
  }
  return bytes;
}

function handIn() {
  checkTrophyData();
  checkScreenshots();
  copyTree(join(repoRoot, 'app'), join(outputDir, 'app'));
  if (existsSync(join(repoRoot, 'screenshots'))) {
    copyTree(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'));
  }

  // The scorer's own caps (reference/gate.json): only text_max_bytes shapes
  // the bytes; the others refuse an entry the scorer would refuse (more than
  // 4 screenshots or one over 256 KiB; more than 993 files and directories
  // in app/ or 48 MiB of app files).
  const dossier = buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  });
  writeFileSync(join(outputDir, 'dossier.json'), dossier);

  const appFiles = countFiles(join(outputDir, 'app'));
  const appBytes = treeBytes(join(outputDir, 'app'));
  const shotFiles = existsSync(join(outputDir, 'screenshots'))
    ? readdirSync(join(outputDir, 'screenshots')).filter((name) => statSync(join(outputDir, 'screenshots', name)).isFile()).length
    : 0;
  console.log(`handed in ${appFiles} app files (${appBytes} bytes) and ${shotFiles} screenshots; dossier.json is ${dossier.length} bytes`);
}

handIn();

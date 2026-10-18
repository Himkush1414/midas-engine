#!/usr/bin/env node
// Real app screens for the website's device mockups, in every language.
// Build the QA web app first (see scripts/screenshots.mjs), then:
//   node scripts/web-shots.mjs [--dist .qa-web] [--lang de]
// Writes apps/web/public/shots/<lang>/<name>.webp (540 px wide, dark theme).
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1] : fallback;
};
const dist = arg('dist', '.qa-web');
const langs = arg('lang', null) ? [arg('lang')] : ['en', 'es', 'pt', 'de', 'fr', 'it'];

/** Scene in scripts/screenshots.mjs → file name on the site. */
const SHOTS = {
  '01-home': 'home',
  '02-reveal': 'reveal',
  '30-results-tierup': 'results',
  '33-duel': 'duel',
  '05-daily': 'daily',
  '23-league': 'league',
  '18-season-recap': 'season',
};

for (const lang of langs) {
  const raw = mkdtempSync(join(tmpdir(), 'web-shots-'));
  const out = join(root, 'apps/web/public/shots', lang);
  await mkdir(out, { recursive: true });
  for (const [scene, name] of Object.entries(SHOTS)) {
    execFileSync('node', [join(root, 'scripts/screenshots.mjs'), '--dist', dist, '--lang', lang, '--scheme', 'dark', '--now', '2026-10-14T12:00:00Z', '--out', raw, '--only', scene], {
      cwd: root,
      stdio: ['ignore', 'ignore', 'inherit'],
    });
    await sharp(join(raw, `${scene}.png`)).resize({ width: 540 }).webp({ quality: 82 }).toFile(join(out, `${name}.webp`));
  }
  rmSync(raw, { recursive: true, force: true });
  console.log(`✓ ${lang}`);
}

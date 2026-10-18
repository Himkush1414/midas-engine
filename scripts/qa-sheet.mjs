#!/usr/bin/env node
// Visual QA: shoots scenes from scripts/screenshots.mjs in dark and light and tiles them into one
// contact sheet (dark | light, side by side, per scene).
//   node scripts/qa-sheet.mjs --out <dir> [--dist .qa-web] [--width 412] [--height 732] [--lang en] [--cols 6] [--tile 330] scene...
// Writes <dir>/dark/*.png, <dir>/light/*.png and <dir>/sheet.jpg. Scenes match by substring.
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const flags = {};
const scenes = [];
for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith('--')) flags[args[i].slice(2)] = args[++i];
  else scenes.push(args[i]);
}
const out = flags.out;
if (!out || scenes.length === 0) {
  console.error('usage: qa-sheet.mjs --out <dir> [options] scene...');
  process.exit(2);
}
const width = Number(flags.width ?? 412);
const height = Number(flags.height ?? 732);
const passthrough = ['--dist', flags.dist ?? '.qa-web', '--width', String(width), '--height', String(height), '--lang', flags.lang ?? 'en'];

rmSync(out, { recursive: true, force: true });
for (const scene of scenes) {
  for (const scheme of ['dark', 'light']) {
    execFileSync('node', [join(root, 'scripts/screenshots.mjs'), ...passthrough, '--scheme', scheme, '--out', join(out, scheme), '--only', scene], {
      cwd: root,
      stdio: ['ignore', 'ignore', 'inherit'],
    });
  }
}

const shots = existsSync(join(out, 'dark')) ? readdirSync(join(out, 'dark')).filter((f) => f.endsWith('.png')).sort() : [];
const files = shots.flatMap((f) => [join(out, 'dark', f), join(out, 'light', f)]).filter(existsSync);
const W = Number(flags.tile ?? 330);
const H = Math.round((W * height) / width);
const C = Number(flags.cols ?? 6);
const R = Math.ceil(files.length / C);
const gap = 8;
const tiles = await Promise.all(files.map((f) => sharp(f).resize(W, H, { fit: 'contain', background: '#333333' }).toBuffer()));
await sharp({ create: { width: W * C + gap * (C - 1), height: H * R + gap * (R - 1), channels: 3, background: '#FF00FF' } })
  .composite(tiles.map((input, k) => ({ input, left: (k % C) * (W + gap), top: Math.floor(k / C) * (H + gap) })))
  .jpeg({ quality: 80 })
  .toFile(join(out, 'sheet.jpg'));
console.log(`sheet: ${join(out, 'sheet.jpg')} (${files.length} shots)`);

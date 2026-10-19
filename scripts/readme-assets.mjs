#!/usr/bin/env node
// README artwork: a hero banner and phone-framed screens, each in a dark and a light version.
// Capture the screens first (QA web export, see scripts/screenshots.mjs), one folder per scheme:
//   for s in dark light; do for n in 01-home 02-reveal 13-game-clash 30-results-tierup 05-daily 33-duel; do
//     node scripts/screenshots.mjs --dist .qa-web --scheme $s --only $n --width 412 --height 892 --now 2026-11-18T12:00:00Z --out <shots>/$s
//   done; done
// Then: node scripts/readme-assets.mjs --shots <shots>
// Writes docs/readme/banner-{dark,light}.png and docs/readme/screens/<name>-{dark,light}.webp.
// Fonts: Big Shoulders and JetBrains Mono must be installed for librsvg (see docs/STORE_LISTING.md → Graphics).
import { mkdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const arg = (name, fallback) => (process.argv.includes(`--${name}`) ? process.argv[process.argv.indexOf(`--${name}`) + 1] : fallback);
const shots = arg('shots');
if (!shots) {
  console.error('usage: readme-assets.mjs --shots <dir with dark/ and light/>');
  process.exit(2);
}
const out = join(root, 'docs/readme');

const SCREENS = ['01-home', '02-reveal', '13-game-clash', '30-results-tierup', '05-daily', '33-duel'];
const THEMES = {
  dark: { field: '#0F0D0B', text: '#F4EFE6', muted: '#B7AD9E', slab: '#D7FF3A', bezel: ['#3A342D', '#0A0908', '#1A1714'], rim: '#4A4239', grain: 0.07 },
  light: { field: '#F1EBE1', text: '#15120F', muted: '#574E44', slab: '#D7FF3A', bezel: ['#3A342D', '#0A0908', '#1A1714'], rim: '#2A2520', grain: 0.05 },
};
const GRAIN = `<filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>`;

/** A phone body around a screenshot with rounded screen corners and a soft drop shadow (transparent outside). */
async function phone(file, width, theme) {
  const pad = Math.round(width * 0.025);
  const shotW = width - pad * 2;
  const meta = await sharp(file).metadata();
  const shotH = Math.round((shotW * meta.height) / meta.width);
  const bodyH = shotH + pad * 2;
  const r = Math.round(width * 0.1);
  const mask = Buffer.from(`<svg width="${shotW}" height="${shotH}"><rect width="${shotW}" height="${shotH}" rx="${r - pad}" ry="${r - pad}"/></svg>`);
  const shot = await sharp(file).resize(shotW, shotH).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();
  const [a, b, c] = theme.bezel;
  const body = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${bodyH}">
    <defs><linearGradient id="b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="0.4" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient></defs>
    <rect x="1" y="1" width="${width - 2}" height="${bodyH - 2}" rx="${r}" ry="${r}" fill="url(#b)" stroke="${theme.rim}" stroke-width="2"/>
  </svg>`);
  const device = await sharp(body).composite([{ input: shot, left: pad, top: pad }]).png().toBuffer();
  const blur = Math.round(width * 0.05);
  const shadow = await sharp({ create: { width: width + blur * 4, height: bodyH + blur * 4, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: Buffer.from(`<svg width="${width}" height="${bodyH}"><rect width="${width}" height="${bodyH}" rx="${r}" fill="#000" fill-opacity="0.45"/></svg>`), left: blur * 2, top: blur * 2 + Math.round(blur * 0.6) }])
    .blur(blur)
    .png()
    .toBuffer();
  return sharp(shadow).composite([{ input: device, left: blur * 2, top: blur * 2 }]).png().toBuffer();
}

async function banner(scheme) {
  const t = THEMES[scheme];
  const W = 1280;
  const H = 440;
  const mark = await readFile(join(root, 'brand/logo-mark.svg'), 'utf8');
  const markPng = await sharp(Buffer.from(mark), { density: 300 }).resize(72, 72).png().toBuffer();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>${GRAIN}</defs>
    <rect width="${W}" height="${H}" fill="${t.field}"/>
    <rect width="${W}" height="${H}" filter="url(#n)" opacity="${t.grain}"/>
    <polygon points="860,0 ${W},0 ${W},${H} 760,${H}" fill="${t.slab}"/>
    <text x="148" y="98" font-family="Big Shoulders" font-weight="900" font-size="52" fill="${t.text}">MINDTIER</text>
    <text x="64" y="228" font-family="Big Shoulders" font-weight="900" font-size="104" fill="${t.text}">WHAT TIER IS</text>
    <text x="64" y="322" font-family="Big Shoulders" font-weight="900" font-size="104" fill="${t.text}">YOUR MIND?</text>
    <polygon points="68,366 112,366 105,380 61,380" fill="${scheme === 'dark' ? t.slab : t.text}"/>
    <text x="126" y="381" font-family="JetBrains Mono" font-weight="700" font-size="17" letter-spacing="2" fill="${t.muted}">RANKED BRAIN GAMES · IRON → GRANDMASTER · NO ADS</text>
  </svg>`;
  const device = await phone(join(shots, scheme, '01-home.png'), 300, t);
  const meta = await sharp(device).metadata();
  const file = join(out, `banner-${scheme}.png`);
  await sharp(Buffer.from(svg))
    .composite([
      { input: markPng, left: 64, top: 44 },
      // The phone stands on the slab and runs off the bottom edge.
      { input: await sharp(device).extract({ left: 0, top: 0, width: meta.width, height: H - 24 }).toBuffer(), left: 880, top: 24 },
    ])
    .png({ compressionLevel: 9, palette: false })
    .toFile(file);
  return file;
}

await mkdir(join(out, 'screens'), { recursive: true });
for (const scheme of ['dark', 'light']) {
  console.log('✓', (await banner(scheme)).replace(root + '/', ''));
  for (const name of SCREENS) {
    const device = await phone(join(shots, scheme, `${name}.png`), 520, THEMES[scheme]);
    const file = join(out, 'screens', `${name.replace(/^\d+-/, '')}-${scheme}.webp`);
    await sharp(device).webp({ quality: 86, alphaQuality: 90 }).toFile(file);
    console.log('✓', file.replace(root + '/', ''));
  }
}

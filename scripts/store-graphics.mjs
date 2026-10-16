#!/usr/bin/env node
// Composes Google Play listing graphics from real screenshots and brand art.
//   node scripts/store-graphics.mjs [--scheme dark]
// Inputs:  store/screenshots/raw/<scheme>/*.png (from scripts/screenshots.mjs)
// Outputs: store/screenshots/phone/*.png (1080×1920) and store/graphics/feature-graphic.png (1024×500)
// Requires the Space Grotesk and Inter fonts to be installed for librsvg (see docs/STORE_LISTING.md).
import { mkdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const scheme = process.argv.includes('--scheme') ? process.argv[process.argv.indexOf('--scheme') + 1] : 'dark';
const raw = (f) => join(root, 'store/screenshots/raw', scheme, f);
const outDir = join(root, 'store/screenshots/phone');

// Order matters: the first two frames carry most installs.
const FRAMES = [
  { file: '02-reveal.png', title: 'What tier is your mind?', sub: 'Five quick placement games. Iron to Grandmaster.' },
  { file: '01-home.png', title: 'A rank that moves', sub: 'Every ranked session updates your rating.' },
  { file: '12-game-grid.png', title: 'Games that adapt to you', sub: 'Never too easy, never impossible.' },
  { file: '04-results.png', title: 'See exactly what changed', sub: 'Clear rating gains and losses per skill.' },
  { file: '05-daily.png', title: 'One Daily Challenge', sub: 'Same puzzles for everyone. One leaderboard.' },
  { file: '07-duels.png', title: 'Duel your friends', sub: 'Identical puzzles. Highest score wins.' },
  { file: '06-profile.png', title: 'Your five-skill shape', sub: 'Memory, Focus, Speed, Logic and Math.' },
  { file: '13-game-clash.png', title: 'No ads. Ever.', sub: 'Free to play daily. Pro if you want more.' },
];

const W = 1080;
const H = 1920;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

function background() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      <radialGradient id="g" cx="50%" cy="0%" r="90%">
        <stop offset="0" stop-color="#2A2470"/>
        <stop offset="0.55" stop-color="#121734"/>
        <stop offset="1" stop-color="#0A0D1A"/>
      </radialGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
  </svg>`;
}

function caption(title, sub) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="330">
    <text x="${W / 2}" y="150" text-anchor="middle" font-family="Space Grotesk" font-weight="700" font-size="76" fill="#F4F6FF">${esc(title)}</text>
    <text x="${W / 2}" y="232" text-anchor="middle" font-family="Inter" font-weight="500" font-size="40" fill="#A3ABD1">${esc(sub)}</text>
  </svg>`;
}

async function frame({ file, title, sub }, index) {
  const shotW = 830;
  const shotH = Math.round((shotW * 1920) / 1080);
  const radius = 54;
  const mask = Buffer.from(`<svg width="${shotW}" height="${shotH}"><rect width="${shotW}" height="${shotH}" rx="${radius}" ry="${radius}"/></svg>`);
  const shot = await sharp(raw(file)).resize(shotW, shotH).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();
  const border = Buffer.from(
    `<svg width="${shotW + 8}" height="${shotH + 8}"><rect x="4" y="4" width="${shotW}" height="${shotH}" rx="${radius}" ry="${radius}" fill="none" stroke="#343D78" stroke-width="4"/></svg>`,
  );
  const left = Math.round((W - shotW) / 2);
  const top = 340;
  const out = join(outDir, `${String(index + 1).padStart(2, '0')}-${file.replace(/^\d+-/, '')}`);
  await sharp(Buffer.from(background()))
    .composite([
      { input: Buffer.from(caption(title, sub)), left: 0, top: 30 },
      { input: shot, left, top },
      { input: border, left: left - 4, top: top - 4 },
    ])
    .png({ compressionLevel: 9 })
    .toFile(out);
  return out;
}

async function featureGraphic() {
  const logo = await readFile(join(root, 'brand/icon-foreground.svg'), 'utf8');
  const logoPng = await sharp(Buffer.from(logo), { density: 300 }).resize(300, 300).png().toBuffer();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500">
    <defs>
      <radialGradient id="g" cx="20%" cy="30%" r="100%">
        <stop offset="0" stop-color="#2A2470"/><stop offset="0.6" stop-color="#121734"/><stop offset="1" stop-color="#0A0D1A"/>
      </radialGradient>
      <linearGradient id="t" x1="0" x2="1"><stop offset="0" stop-color="#A996FF"/><stop offset="1" stop-color="#22D3EE"/></linearGradient>
    </defs>
    <rect width="1024" height="500" fill="url(#g)"/>
    <text x="372" y="210" font-family="Space Grotesk" font-weight="700" font-size="104" fill="#F4F6FF">Mindtier</text>
    <text x="376" y="282" font-family="Space Grotesk" font-weight="600" font-size="44" fill="url(#t)">What tier is your mind?</text>
    <text x="376" y="340" font-family="Inter" font-weight="500" font-size="28" fill="#A3ABD1">Ranked brain games · Daily Challenge · Duels</text>
  </svg>`;
  const out = join(root, 'store/graphics/feature-graphic.png');
  await sharp(Buffer.from(svg))
    .composite([{ input: logoPng, left: 52, top: 100 }])
    .png({ compressionLevel: 9 })
    .toFile(out);
  return out;
}

await mkdir(outDir, { recursive: true });
await mkdir(join(root, 'store/graphics'), { recursive: true });
for (const [i, f] of FRAMES.entries()) console.log('✓', (await frame(f, i)).replace(root + '/', ''));
console.log('✓', (await featureGraphic()).replace(root + '/', ''));

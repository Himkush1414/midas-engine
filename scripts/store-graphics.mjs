#!/usr/bin/env node
// Composes Google Play listing graphics from real screenshots and brand art.
//   node scripts/store-graphics.mjs [--scheme dark] [--lang en|es|pt|de|fr]
// Inputs:  store/screenshots/raw/<scheme>[-<lang>]/*.png (from scripts/screenshots.mjs --lang)
// Outputs: store/screenshots/phone[/<lang>]/*.png (1080×1920) and store/graphics/feature-graphic[-<lang>].png (1024×500);
//          English keeps the unsuffixed paths.
// Requires the Space Grotesk and Inter fonts to be installed for librsvg (see docs/STORE_LISTING.md).
import { mkdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const arg = (name, fallback) => (process.argv.includes(`--${name}`) ? process.argv[process.argv.indexOf(`--${name}`) + 1] : fallback);
const scheme = arg('scheme', 'dark');
const lang = arg('lang', 'en');
const suffix = lang === 'en' ? '' : `-${lang}`;
const raw = (f) => join(root, 'store/screenshots/raw', `${scheme}${suffix}`, f);
const outDir = join(root, 'store/screenshots/phone', lang === 'en' ? '' : lang);

// Order matters: the first two frames carry most installs. Same frame order in every language.
const FILES = ['02-reveal.png', '01-home.png', '12-game-grid.png', '04-results.png', '05-daily.png', '07-duels.png', '06-profile.png', '13-game-clash.png'];

/** Per language: [title, subtitle] for each frame, then the feature-graphic tagline and strapline. */
const COPY = {
  en: {
    frames: [
      ['What tier is your mind?', 'Five quick placement games. Iron to Grandmaster.'],
      ['A rank that moves', 'Every ranked session updates your rating.'],
      ['Games that adapt to you', 'Never too easy, never impossible.'],
      ['See exactly what changed', 'Clear rating gains and losses per skill.'],
      ['One Daily Challenge', 'Same puzzles for everyone. One leaderboard.'],
      ['Duel your friends', 'Identical puzzles. Highest score wins.'],
      ['Your five-skill shape', 'Memory, Focus, Speed, Logic and Math.'],
      ['No ads. Ever.', 'Free to play daily. Pro if you want more.'],
    ],
    tagline: 'What tier is your mind?',
    strap: 'Ranked brain games · Daily Challenge · Duels',
  },
  es: {
    frames: [
      ['¿En qué rango está tu mente?', 'Cinco juegos rápidos de clasificación. De Hierro a Gran Maestro.'],
      ['Un rango que se mueve', 'Cada sesión clasificada actualiza tu puntuación.'],
      ['Juegos que se adaptan a ti', 'Nunca demasiado fáciles, nunca imposibles.'],
      ['Mira exactamente qué cambió', 'Subidas y bajadas claras en cada habilidad.'],
      ['Un reto diario', 'Los mismos puzles para todos. Una clasificación.'],
      ['Reta a tus amigos', 'Puzles idénticos. Gana la mejor puntuación.'],
      ['Tus cinco habilidades', 'Memoria, Atención, Velocidad, Lógica y Cálculo.'],
      ['Sin anuncios. Nunca.', 'Gratis cada día. Pro si quieres más.'],
    ],
    tagline: '¿En qué rango está tu mente?',
    strap: 'Juegos mentales clasificados · Reto diario · Duelos',
  },
  pt: {
    frames: [
      ['Em que nível está sua mente?', 'Cinco jogos rápidos de classificação. Do Ferro ao Grão-Mestre.'],
      ['Um nível que se move', 'Cada sessão ranqueada atualiza sua pontuação.'],
      ['Jogos que se adaptam a você', 'Nunca fáceis demais, nunca impossíveis.'],
      ['Veja exatamente o que mudou', 'Ganhos e perdas claros em cada habilidade.'],
      ['Um desafio diário', 'Os mesmos quebra-cabeças para todos. Um ranking.'],
      ['Desafie seus amigos', 'Quebra-cabeças idênticos. Vence a maior pontuação.'],
      ['Suas cinco habilidades', 'Memória, Foco, Velocidade, Lógica e Cálculo.'],
      ['Sem anúncios. Nunca.', 'Grátis todo dia. Pro se quiser mais.'],
    ],
    tagline: 'Em que nível está sua mente?',
    strap: 'Jogos mentais ranqueados · Desafio diário · Duelos',
  },
  de: {
    frames: [
      ['Auf welchem Rang ist dein Kopf?', 'Fünf kurze Einstufungsspiele. Von Eisen bis Großmeister.'],
      ['Ein Rang, der sich bewegt', 'Jede gewertete Sitzung ändert deine Wertung.'],
      ['Spiele, die sich anpassen', 'Nie zu leicht, nie unmöglich.'],
      ['Sieh genau, was sich ändert', 'Klare Gewinne und Verluste pro Fähigkeit.'],
      ['Ein Tagesrätsel', 'Dieselben Rätsel für alle. Eine Bestenliste.'],
      ['Fordere Freunde heraus', 'Identische Rätsel. Die höchste Punktzahl gewinnt.'],
      ['Deine fünf Fähigkeiten', 'Gedächtnis, Fokus, Tempo, Logik und Rechnen.'],
      ['Keine Werbung. Niemals.', 'Täglich gratis spielen. Pro, wenn du mehr willst.'],
    ],
    tagline: 'Auf welchem Rang ist dein Kopf?',
    strap: 'Gewertete Denkspiele · Tagesrätsel · Duelle',
  },
  fr: {
    frames: [
      ['À quel rang est ton esprit ?', 'Cinq jeux de placement rapides. Du Fer au Grand Maître.'],
      ['Un rang qui bouge', 'Chaque session classée met à jour ton score.'],
      ['Des jeux qui s’adaptent', 'Jamais trop faciles, jamais impossibles.'],
      ['Vois exactement ce qui change', 'Gains et pertes clairs pour chaque compétence.'],
      ['Un défi par jour', 'Les mêmes énigmes pour tous. Un classement.'],
      ['Défie tes amis', 'Des énigmes identiques. Le meilleur score gagne.'],
      ['Tes cinq compétences', 'Mémoire, Attention, Vitesse, Logique et Calcul.'],
      ['Pas de pub. Jamais.', 'Gratuit chaque jour. Pro si tu veux plus.'],
    ],
    tagline: 'À quel rang est ton esprit ?',
    strap: 'Jeux de réflexion classés · Défi du jour · Duels',
  },
};
const copy = COPY[lang];
if (!copy) throw new Error(`Unknown --lang ${lang}; expected one of ${Object.keys(COPY).join(', ')}`);
const FRAMES = FILES.map((file, i) => ({ file, title: copy.frames[i][0], sub: copy.frames[i][1] }));

const W = 1080;
const H = 1920;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

/** Shrink a font so text fits `width`; `em` is the face's average glyph width (Space Grotesk bold ≈ 0.56, Inter ≈ 0.52). */
const fit = (text, size, width, em) => Math.min(size, Math.floor(width / (text.length * em)));

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
    <text x="${W / 2}" y="150" text-anchor="middle" font-family="Space Grotesk" font-weight="700" font-size="${fit(title, 76, 1040, 0.56)}" fill="#F4F6FF">${esc(title)}</text>
    <text x="${W / 2}" y="232" text-anchor="middle" font-family="Inter" font-weight="500" font-size="${fit(sub, 40, 1040, 0.52)}" fill="#A3ABD1">${esc(sub)}</text>
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
    <text x="376" y="282" font-family="Space Grotesk" font-weight="600" font-size="${fit(copy.tagline, 44, 648, 0.56)}" fill="url(#t)">${esc(copy.tagline)}</text>
    <text x="376" y="340" font-family="Inter" font-weight="500" font-size="${fit(copy.strap, 28, 648, 0.52)}" fill="#A3ABD1">${esc(copy.strap)}</text>
  </svg>`;
  const out = join(root, `store/graphics/feature-graphic${suffix}.png`);
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

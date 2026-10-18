#!/usr/bin/env node
// Composes Google Play listing graphics from real screenshots and brand art.
//   node scripts/store-graphics.mjs [--scheme dark] [--lang en|es|pt|de|fr]
// Inputs:  store/screenshots/raw/<scheme>[-<lang>]/*.png (from scripts/screenshots.mjs --lang)
// Outputs: store/screenshots/phone[/<lang>]/*.png (1080×1920) and store/graphics/feature-graphic[-<lang>].png (1024×500);
//          English keeps the unsuffixed paths.
// Floodlight style (docs/DESIGN_DIRECTION.md). Requires Big Shoulders, Instrument Sans and JetBrains Mono installed for
// librsvg: copy apps/web/src/assets/fonts/*.ttf to ~/.local/share/fonts and run fc-cache (see docs/STORE_LISTING.md).
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
      ['What tier is your mind?', 'Six quick placement games. Iron to Grandmaster.'],
      ['A rank that moves', 'Every ranked session updates your rating.'],
      ['Games that adapt to you', 'Never too easy, never impossible.'],
      ['See exactly what changed', 'Clear rating gains and losses per skill.'],
      ['One Daily Challenge', 'Same puzzles for everyone. One leaderboard.'],
      ['Duel your friends', 'Identical puzzles. Highest score wins.'],
      ['Your six-skill shape', 'Memory, Focus, Speed, Logic, Math and Language.'],
      ['No ads. Ever.', 'Free to play daily. Pro if you want more.'],
    ],
    tagline: 'What tier is your mind?',
    strap: 'Ranked brain games · Daily Challenge · Duels',
  },
  es: {
    frames: [
      ['¿En qué rango está tu mente?', 'Seis juegos rápidos de clasificación. De Hierro a Gran Maestro.'],
      ['Un rango que se mueve', 'Cada sesión clasificada actualiza tu puntuación.'],
      ['Juegos que se adaptan a ti', 'Nunca demasiado fáciles, nunca imposibles.'],
      ['Mira exactamente qué cambió', 'Subidas y bajadas claras en cada habilidad.'],
      ['Un reto diario', 'Los mismos puzles para todos. Una clasificación.'],
      ['Reta a tus amigos', 'Puzles idénticos. Gana la mejor puntuación.'],
      ['Tus seis habilidades', 'Memoria, Atención, Velocidad, Lógica, Cálculo y Lenguaje.'],
      ['Sin anuncios. Nunca.', 'Gratis cada día. Pro si quieres más.'],
    ],
    tagline: '¿En qué rango está tu mente?',
    strap: 'Juegos mentales clasificados · Reto diario · Duelos',
  },
  pt: {
    frames: [
      ['Em que nível está sua mente?', 'Seis jogos rápidos de classificação. Do Ferro ao Grão-Mestre.'],
      ['Um nível que se move', 'Cada sessão ranqueada atualiza sua pontuação.'],
      ['Jogos que se adaptam a você', 'Nunca fáceis demais, nunca impossíveis.'],
      ['Veja exatamente o que mudou', 'Ganhos e perdas claros em cada habilidade.'],
      ['Um desafio diário', 'Os mesmos quebra-cabeças para todos. Um ranking.'],
      ['Desafie seus amigos', 'Quebra-cabeças idênticos. Vence a maior pontuação.'],
      ['Suas seis habilidades', 'Memória, Foco, Velocidade, Lógica, Cálculo e Linguagem.'],
      ['Sem anúncios. Nunca.', 'Grátis todo dia. Pro se quiser mais.'],
    ],
    tagline: 'Em que nível está sua mente?',
    strap: 'Jogos mentais ranqueados · Desafio diário · Duelos',
  },
  de: {
    frames: [
      ['Auf welchem Rang ist dein Kopf?', 'Sechs kurze Einstufungsspiele. Von Eisen bis Großmeister.'],
      ['Ein Rang, der sich bewegt', 'Jede gewertete Sitzung ändert deine Wertung.'],
      ['Spiele, die sich anpassen', 'Nie zu leicht, nie unmöglich.'],
      ['Sieh genau, was sich ändert', 'Klare Gewinne und Verluste pro Fähigkeit.'],
      ['Ein Tagesrätsel', 'Dieselben Rätsel für alle. Eine Bestenliste.'],
      ['Fordere Freunde heraus', 'Identische Rätsel. Die höchste Punktzahl gewinnt.'],
      ['Deine sechs Fähigkeiten', 'Gedächtnis, Fokus, Tempo, Logik, Rechnen und Sprache.'],
      ['Keine Werbung. Niemals.', 'Täglich gratis spielen. Pro, wenn du mehr willst.'],
    ],
    tagline: 'Auf welchem Rang ist dein Kopf?',
    strap: 'Gewertete Denkspiele · Tagesrätsel · Duelle',
  },
  fr: {
    frames: [
      ['À quel rang est ton esprit ?', 'Six jeux de placement rapides. Du Fer au Grand Maître.'],
      ['Un rang qui bouge', 'Chaque session classée met à jour ton score.'],
      ['Des jeux qui s’adaptent', 'Jamais trop faciles, jamais impossibles.'],
      ['Vois exactement ce qui change', 'Gains et pertes clairs pour chaque compétence.'],
      ['Un défi par jour', 'Les mêmes énigmes pour tous. Un classement.'],
      ['Défie tes amis', 'Des énigmes identiques. Le meilleur score gagne.'],
      ['Tes six compétences', 'Mémoire, Attention, Vitesse, Logique, Calcul et Langage.'],
      ['Pas de pub. Jamais.', 'Gratuit chaque jour. Pro si tu veux plus.'],
    ],
    tagline: 'À quel rang est ton esprit ?',
    strap: 'Jeux de réflexion classés · Défi du jour · Duels',
  },
  it: {
    frames: [
      ['A che grado è la tua mente?', 'Sei partite rapide di piazzamento. Da Ferro a Gran Maestro.'],
      ['Un grado che si muove', 'Ogni sessione classificata aggiorna il tuo punteggio.'],
      ['Giochi che si adattano a te', 'Mai troppo facili, mai impossibili.'],
      ['Vedi cosa è cambiato', 'Guadagni e perdite chiari per ogni abilità.'],
      ['Una sfida al giorno', 'Gli stessi rompicapi per tutti. Una classifica.'],
      ['Sfida i tuoi amici', 'Rompicapi identici. Vince il punteggio più alto.'],
      ['Le tue sei abilità', 'Memoria, Attenzione, Velocità, Logica, Calcolo e Linguaggio.'],
      ['Niente pubblicità. Mai.', 'Gratis ogni giorno. Pro se vuoi di più.'],
    ],
    tagline: 'A che grado è la tua mente?',
    strap: 'Giochi di logica a gradi · Sfida del giorno · Duelli',
  },
};
const copy = COPY[lang];
if (!copy) throw new Error(`Unknown --lang ${lang}; expected one of ${Object.keys(COPY).join(', ')}`);
const FRAMES = FILES.map((file, i) => ({ file, title: copy.frames[i][0], sub: copy.frames[i][1] }));

const W = 1080;
const H = 1920;
const INK = '#0F0D0B';
const CHALK = '#F4EFE6';
const MUTED = '#B7AD9E';
/** Accent per frame, cycling volt → spark → ice → flare (the Floodlight signal colours). */
const ACCENTS = ['#D7FF3A', '#FFC93D', '#8FE3FF', '#FF5B35'];
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

/** Greedy word wrap with an average glyph width `em` (Big Shoulders Black ≈ 0.52, Instrument Sans ≈ 0.5). */
function wrap(text, size, width, em) {
  const lines = [];
  let line = '';
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (next.length * size * em > width && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

/** Largest size (≤ max) at which `text` fits in `maxLines` lines of `width`. */
function fitLines(text, max, width, em, maxLines) {
  for (let size = max; size > 24; size -= 2) {
    const lines = wrap(text, size, width, em);
    if (lines.length <= maxLines && lines.every((l) => l.length * size * em <= width)) return { size, lines };
  }
  return { size: 24, lines: wrap(text, 24, width, em) };
}

const GRAIN = `<filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>`;

function background(accent) {
  // The phone stands on a slanted slab of the frame's accent colour.
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>${GRAIN}</defs>
    <rect width="100%" height="100%" fill="${INK}"/>
    <rect width="100%" height="100%" filter="url(#n)" opacity="0.07"/>
    <polygon points="0,1110 ${W},900 ${W},${H} 0,${H}" fill="${accent}"/>
    <polygon points="0,1110 ${W},900 ${W},930 0,1140" fill="${INK}" opacity="0.18"/>
  </svg>`;
}

function caption(index, title, sub, accent) {
  const t = fitLines(title.toLocaleUpperCase(), 132, 960, 0.52, 2);
  const s = fitLines(sub, 42, 960, 0.5, 2);
  const titleTop = 230;
  const lineH = Math.round(t.size * 0.9);
  const subTop = titleTop + lineH * (t.lines.length - 1) + 78;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="560">
    <polygon points="60,96 112,96 104,114 52,114" fill="${accent}"/>
    <text x="128" y="114" font-family="JetBrains Mono" font-weight="700" font-size="26" letter-spacing="5" fill="${MUTED}">${String(index + 1).padStart(2, '0')} / ${String(FILES.length).padStart(2, '0')}</text>
    ${t.lines.map((l, i) => `<text x="60" y="${titleTop + i * lineH}" font-family="Big Shoulders" font-weight="900" font-size="${t.size}" fill="${CHALK}">${esc(l)}</text>`).join('')}
    ${s.lines.map((l, i) => `<text x="60" y="${subTop + i * Math.round(s.size * 1.3)}" font-family="Instrument Sans" font-weight="500" font-size="${s.size}" fill="${MUTED}">${esc(l)}</text>`).join('')}
  </svg>`;
}

/** A phone body around the screenshot, with a soft shadow, tilted a few degrees. */
async function phone(file, width, tilt) {
  const pad = 18;
  const shotW = width - pad * 2;
  const shotH = Math.round((shotW * 1920) / 1080);
  const bodyH = shotH + pad * 2;
  const mask = Buffer.from(`<svg width="${shotW}" height="${shotH}"><rect width="${shotW}" height="${shotH}" rx="62" ry="62"/></svg>`);
  const shot = await sharp(raw(file)).resize(shotW, shotH).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();
  const body = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${bodyH}">
    <defs><linearGradient id="b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3A342D"/><stop offset="0.4" stop-color="#0A0908"/><stop offset="1" stop-color="#1A1714"/></linearGradient></defs>
    <rect x="1" y="1" width="${width - 2}" height="${bodyH - 2}" rx="78" ry="78" fill="url(#b)" stroke="#4A4239" stroke-width="2"/>
  </svg>`);
  const device = await sharp(body).composite([{ input: shot, left: pad, top: pad }]).png().toBuffer();
  const shadow = await sharp({ create: { width: width + 160, height: bodyH + 160, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: Buffer.from(`<svg width="${width}" height="${bodyH}"><rect width="${width}" height="${bodyH}" rx="78" fill="#000" fill-opacity="0.6"/></svg>`), left: 80, top: 110 }])
    .blur(36)
    .png()
    .toBuffer();
  const stacked = await sharp(shadow).composite([{ input: device, left: 80, top: 80 }]).png().toBuffer();
  return sharp(stacked).rotate(tilt, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
}

async function frame({ file, title, sub }, index) {
  const accent = ACCENTS[index % ACCENTS.length];
  const device = await phone(file, 720, index % 2 ? 3 : -3);
  const meta = await sharp(device).metadata();
  const out = join(outDir, `${String(index + 1).padStart(2, '0')}-${file.replace(/^\d+-/, '')}`);
  await sharp(Buffer.from(background(accent)))
    .composite([
      { input: Buffer.from(caption(index, title, sub, accent)), left: 0, top: 0 },
      // Bleeds off the bottom: the top of the screen is what matters.
      { input: await sharp(device).extract({ left: 0, top: 0, width: meta.width, height: Math.min(meta.height, H - 590) }).toBuffer(), left: Math.round((W - meta.width) / 2), top: 590 },
    ])
    .png({ compressionLevel: 9 })
    .toFile(out);
  return out;
}

async function featureGraphic() {
  const mark = await readFile(join(root, 'brand/logo-mark.svg'), 'utf8');
  const markPng = await sharp(Buffer.from(mark), { density: 300 }).resize(96, 96).png().toBuffer();
  const tag = fitLines(copy.tagline.toLocaleUpperCase(), 76, 560, 0.52, 2);
  const lineH = Math.round(tag.size * 0.9);
  // Mono strapline kept inside the text column, clear of the phone.
  const strap = fitLines(copy.strap.toLocaleUpperCase(), 18, 470, 0.68, 2);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500">
    <defs>${GRAIN}</defs>
    <rect width="1024" height="500" fill="${INK}"/>
    <rect width="1024" height="500" filter="url(#n)" opacity="0.07"/>
    <polygon points="660,0 1024,0 1024,500 560,500" fill="#D7FF3A"/>
    <text x="164" y="104" font-family="Big Shoulders" font-weight="900" font-size="60" fill="${CHALK}">MINDTIER</text>
    ${tag.lines.map((l, i) => `<text x="56" y="${214 + i * lineH}" font-family="Big Shoulders" font-weight="900" font-size="${tag.size}" fill="${CHALK}">${esc(l)}</text>`).join('')}
    ${strap.lines.map((l, i) => `<text x="56" y="${214 + (tag.lines.length - 1) * lineH + 62 + i * 28}" font-family="JetBrains Mono" font-weight="700" font-size="${strap.size}" letter-spacing="2" fill="${MUTED}">${esc(l)}</text>`).join('')}
  </svg>`;
  const device = await phone(FILES[0], 300, 6);
  const meta = await sharp(device).metadata();
  const out = join(root, `store/graphics/feature-graphic${suffix}.png`);
  await sharp(Buffer.from(svg))
    .composite([
      { input: markPng, left: 52, top: 40 },
      // The phone runs off the right and bottom edges.
      { input: await sharp(device).extract({ left: 0, top: 0, width: meta.width - 30, height: 440 }).toBuffer(), left: 1024 - meta.width + 30, top: 60 },
    ])
    .png({ compressionLevel: 9 })
    .toFile(out);
  return out;
}

await mkdir(outDir, { recursive: true });
await mkdir(join(root, 'store/graphics'), { recursive: true });
for (const [i, f] of FRAMES.entries()) console.log('✓', (await frame(f, i)).replace(root + '/', ''));
console.log('✓', (await featureGraphic()).replace(root + '/', ''));

#!/usr/bin/env node
// Captures real screenshots of the app rendered with react-native-web.
// Build once:  cd apps/mobile && EXPO_PUBLIC_QA_HOOKS=1 npx expo export --platform web --output-dir ../../.qa-web
// Then:        node scripts/screenshots.mjs [--dist .qa-web] [--scheme dark|light] [--lang en|es|pt|de|fr] [--only name] [--out dir]
// (or point --base at a running `expo start --web` dev server)
// Writes raw captures to store/screenshots/raw/<scheme>[-<lang>]/ (1080×1920, 9:16 for Google Play),
// or to --out for QA-only captures that should stay out of git.
import { createReadStream, existsSync, statSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname } from 'node:path';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1] : fallback;
};
const DIST = arg('dist', null);
let BASE = arg('base', 'http://localhost:8099');

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.ttf': 'font/ttf', '.wav': 'audio/wav', '.ico': 'image/x-icon' };

/** Static server with single-page-app fallback for an `expo export --platform web` folder. */
function serve(dir) {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      const path = decodeURIComponent((req.url ?? '/').split('?')[0]);
      let file = join(dir, path);
      if (!existsSync(file) || statSync(file).isDirectory()) file = join(dir, 'index.html');
      res.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' });
      createReadStream(file).pipe(res);
    });
    server.listen(0, () => resolve(server));
  });
}
const SCHEME = arg('scheme', 'dark');
const ONLY = arg('only', null);
const LANG = arg('lang', 'en');
const OUT = arg('out', null) ?? join(root, 'store/screenshots/raw', LANG === 'en' ? SCHEME : `${SCHEME}-${LANG}`);

// 412×732 CSS px at 2.625× ≈ 1080×1920.
const VIEWPORT = { width: 412, height: 732 };
const DPR = 1080 / 412;

const DAY = 86_400_000;
const now = Date.now();
const today = new Date(now).toISOString().slice(0, 10);

/** Sample player for screenshots: a steadily improving Platinum climber. */
function demoState() {
  const targets = { memory: 1655, focus: 1560, speed: 1735, logic: 1490, math: 1610 };
  const history = [];
  for (const [domain, end] of Object.entries(targets)) {
    for (let i = 0; i < 28; i++) {
      const t = i / 27;
      const wobble = Math.sin(i * 1.7 + end) * 22;
      history.push({ at: now - (27 - i) * DAY, domain, rating: 1300 + (end - 1300) * t + (i === 27 ? 0 : wobble), rd: 220 - 150 * t });
    }
  }
  history.sort((a, b) => a.at - b.at);
  const ratings = Object.fromEntries(Object.entries(targets).map(([d, r]) => [d, { rating: r, rd: 68, volatility: 0.06 }]));
  return {
    'mindtier.progress.v1': {
      state: {
        userSeed: 'demo-seed-0001',
        placementDone: true,
        ratings,
        history,
        rankedSessionIndex: 41,
        usageDay: '',
        usage: { rankedSessions: 0, duelsCreated: 0 },
        streak: { current: 12, best: 19, shields: 1, lastDay: new Date(now - DAY).toISOString().slice(0, 10) },
        daily: {},
        gamesPlayed: 186,
        outbox: [],
      },
      version: 1,
    },
    'mindtier.account.v1': { state: { displayName: 'Alex', email: null, userId: null }, version: 1 },
    'mindtier.settings.v1': {
      state: { theme: SCHEME, language: LANG, sound: true, haptics: true, motion: 'reduced', shapeMode: false, reminderEnabled: true, reminderHour: 19, reminderMinute: 0, hiddenGames: [] },
      version: 1,
    },
    'mindtier.duels.v1': {
      state: {
        duels: [
          { id: 'k7px2mqa', role: 'creator', createdAt: now - 3600_000, expiresAt: null, myPoints: 2140, opponent: { name: 'Sam', points: 1985 } },
          { id: 'r4nd8wce', role: 'challenger', createdAt: now - 7200_000, expiresAt: null, myPoints: null, opponent: null },
        ],
      },
      version: 1,
    },
  };
}

const BOARD = {
  day: today,
  total: 4812,
  top: [
    { place: 1, name: 'Nova', points: 3120, me: false },
    { place: 2, name: 'Kenji', points: 3065, me: false },
    { place: 3, name: 'Priya', points: 2990, me: false },
    { place: 4, name: 'Mateo', points: 2941, me: false },
    { place: 5, name: 'Alex', points: 2905, me: true },
    { place: 6, name: 'Lea', points: 2870, me: false },
    { place: 7, name: 'Omar', points: 2810, me: false },
  ],
  me: { place: 5, points: 2905, total: 4812, percentile: 100 },
};

async function stubNetwork(page, { fresh = false } = {}) {
  await page.route(/supabase\.co|\/api\/v1\//, async (route) => {
    const url = route.request().url();
    if (url.includes('/auth/v1/signup')) {
      return route.fulfill({
        json: {
          access_token: 'demo.token.value', token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(now / 1000) + 3600,
          refresh_token: 'demo-refresh',
          user: { id: '00000000-0000-4000-8000-000000000001', aud: 'authenticated', role: 'authenticated', is_anonymous: true, app_metadata: {}, user_metadata: {}, created_at: new Date(now).toISOString() },
        },
      });
    }
    if (url.includes('/api/v1/bootstrap') && !fresh) {
      const st = demoState()['mindtier.progress.v1'].state;
      return route.fulfill({
        json: { profile: { id: 'demo', seed: st.userSeed, displayName: 'Alex' }, ratings: st.ratings, isPro: false, usage: { rankedSessions: 0, duelsCreated: 0 }, nextSessionIndex: 41, placementDone: true },
      });
    }
    if (url.includes('/api/v1/events')) return route.fulfill({ status: 202, json: { accepted: 0 } });
    if (url.includes('/api/v1/daily/')) return route.fulfill({ json: BOARD });
    if (url.includes('/api/v1/duels/')) {
      return route.fulfill({
        json: {
          id: 'k7px2mqa', createdAt: new Date(now).toISOString(), expiresAt: new Date(now + 6 * DAY).toISOString(), expired: false,
          games: [], creatorName: 'Alex', winner: 'creator',
          entries: [
            { name: 'Alex', points: 2140, accuracy: [0.9, 0.8, 1], isCreator: true, isMe: true },
            { name: 'Sam', points: 1985, accuracy: [0.8, 0.7, 0.9], isCreator: false, isMe: false },
          ],
        },
      });
    }
    // Everything else (auth, bootstrap, uploads) fails fast: the app stays offline-first.
    return route.abort();
  });
}

const settle = (page, ms = 900) => page.waitForTimeout(ms);

/** Remove Expo's development error toast (web-only dev overlay) before capturing. */
async function hideDevOverlay(page) {
  await page.evaluate(() => {
    for (const el of document.querySelectorAll('body *')) {
      const text = el.textContent ?? '';
      if (!/React does not recognize|non-boolean attribute/.test(text) || el.children.length > 6) continue;
      let node = el;
      while (node && node !== document.body && getComputedStyle(node).position !== 'fixed') node = node.parentElement;
      if (node && node !== document.body) node.style.display = 'none';
    }
  });
}
const store = (page, fn, arg) => page.evaluate(fn, arg);

const SCENES = [
  { name: '01-home', path: '/' },
  {
    name: '02-reveal',
    path: '/',
    before: async (page) => {
      await store(page, () => {
        const { useSession, useProgress } = globalThis.__mindtier.stores;
        const ratings = useProgress.getState().ratings;
        const before = Object.fromEntries(Object.entries(ratings).map(([d, r]) => [d, { ...r, rating: 1300, rd: 350 }]));
        useSession.setState({
          finished: { plan: { mode: 'placement', seed: 'x', games: [] }, runs: [], ratingsBefore: before, result: { ratings, updates: [] } },
        });
        globalThis.__mindtier.router.push('/reveal');
      });
      await settle(page, 2600);
    },
  },
  {
    name: '03-game-flank',
    path: '/',
    before: async (page) => {
      await store(page, () => {
        const { useSession } = globalThis.__mindtier.stores;
        useSession.getState().start({ mode: 'ranked', seed: 'shot|flank', games: ['flank', 'pattern', 'grid-recall'] });
        globalThis.__mindtier.router.push('/session');
      });
      await settle(page);
      await page.getByTestId('intro-start').click();
      await settle(page, 2250);
    },
  },
  {
    name: '04-results',
    path: '/',
    before: async (page) => {
      await store(page, () => {
        const { useSession, useProgress } = globalThis.__mindtier.stores;
        const after = useProgress.getState().ratings;
        const before = { ...after, memory: { ...after.memory, rating: after.memory.rating - 21 }, speed: { ...after.speed, rating: after.speed.rating - 14 }, logic: { ...after.logic, rating: after.logic.rating + 6 } };
        const upd = (domain, gameId) => ({ domain, gameId, before: before[domain], after: after[domain], delta: Math.round(after[domain].rating) - Math.round(before[domain].rating), change: 'none' });
        useSession.setState({
          finished: {
            plan: { mode: 'ranked', seed: 'x', games: ['grid-recall', 'snap', 'route'] },
            runs: [],
            ratingsBefore: before,
            result: { ratings: after, updates: [upd('memory', 'grid-recall'), upd('speed', 'snap'), upd('logic', 'route')] },
          },
        });
        globalThis.__mindtier.router.push('/results');
      });
      await settle(page, 1500);
    },
  },
  {
    name: '05-daily',
    path: '/',
    before: async (page) => {
      await store(page, (day) => {
        const { useProgress } = globalThis.__mindtier.stores;
        useProgress.setState((s) => ({ daily: { ...s.daily, [day]: { points: 2905, accuracy: [0.9, 0.8, 1], completedAt: Date.now() } } }));
        globalThis.__mindtier.router.push('/daily');
      }, today);
      await settle(page, 1500);
    },
  },
  { name: '06-profile', path: '/', before: async (page) => { await store(page, () => globalThis.__mindtier.router.push('/profile')); await settle(page, 1200); } },
  { name: '07-duels', path: '/', before: async (page) => { await store(page, () => globalThis.__mindtier.router.push('/duels')); await settle(page); } },
  {
    name: '08-game-pattern',
    path: '/',
    before: async (page) => {
      await store(page, () => {
        const { useSession } = globalThis.__mindtier.stores;
        useSession.getState().start({ mode: 'ranked', seed: 'shot|pattern', games: ['pattern', 'flank', 'grid-recall'] });
        globalThis.__mindtier.router.push('/session');
      });
      await settle(page);
      await page.getByTestId('intro-start').click();
      await settle(page, 2400);
    },
  },
  { name: '09-paywall', path: '/', before: async (page) => { await store(page, () => globalThis.__mindtier.router.push('/paywall')); await settle(page, 1200); } },
  { name: '10-welcome', path: '/', fresh: true },
  ...[
    ['11-game-route', 'route', 2400],
    ['12-game-grid', 'grid-recall', 2150],
    ['13-game-clash', 'clash', 2300],
  ].map(([name, game, wait]) => ({
    name,
    path: '/',
    before: async (page) => {
      await store(page, (g) => {
        const { useSession } = globalThis.__mindtier.stores;
        useSession.getState().start({ mode: 'ranked', seed: `shot|${g}`, games: [g, 'flank', 'pattern'] });
        globalThis.__mindtier.router.push('/session');
      }, game);
      await settle(page);
      await page.getByTestId('intro-start').click();
      await settle(page, wait);
    },
  })),
  // QA only (not used for the store): settings is the longest localized list.
  ...[
    ['14-settings', 0],
    ['15-settings-mid', 640],
    ['16-settings-end', 10_000],
  ].map(([name, scroll]) => ({
    name,
    path: '/',
    before: async (page) => {
      await store(page, () => globalThis.__mindtier.router.push('/settings'));
      await settle(page, 1200);
      if (!scroll) return;
      await page.mouse.move(VIEWPORT.width / 2, VIEWPORT.height / 2);
      await page.mouse.wheel(0, scroll);
      await settle(page, 800);
    },
  })),
  // QA only: a season that just started (Home intro) and a season recap.
  { name: '17-season-notice', path: '/', before: async (page) => { await store(page, seedSeasons, { notice: true }); await settle(page, 1200); } },
  ...[
    ['18-season-recap', 0],
    ['19-season-recap-end', 10_000],
  ].map(([name, scroll]) => ({
    name,
    path: '/',
    before: async (page) => {
      await store(page, seedSeasons, { notice: false });
      await store(page, () => globalThis.__mindtier.router.push('/season'));
      await settle(page, 1200);
      if (!scroll) return;
      await page.mouse.move(VIEWPORT.width / 2, VIEWPORT.height / 2);
      await page.mouse.wheel(0, scroll);
      await settle(page, 800);
    },
  })),
];

/** Runs in the page: three seasons of sample stats on top of the demo player. */
function seedSeasons({ notice }) {
  const stats = (season, sessions, start, peak, end, gains) => ({ season, sessions, games: sessions * 3, startRating: start, peakRating: peak, endRating: end, gains });
  globalThis.__mindtier.stores.useProgress.setState({
    ratingsSeason: 3,
    seasonStats: notice ? null : stats(3, 14, 1560, 1641, 1610, { memory: 48, focus: -6, speed: 71, logic: 12, math: 25 }),
    pastSeasons: [
      stats(2, 31, 1488, 1622, 1608, { memory: 92, focus: 40, speed: 110, logic: 35, math: 58 }),
      stats(1, 12, 1300, 1495, 1488, { memory: 210, focus: 160, speed: 250, logic: 140, math: 190 }),
    ],
    seasonNotice: notice ? 3 : null,
  });
}

let server = null;
if (DIST) {
  server = await serve(join(root, DIST));
  BASE = `http://localhost:${server.address().port}`;
}
const browser = await chromium.launch();
await mkdir(OUT, { recursive: true });
for (const scene of SCENES) {
  if (ONLY && !scene.name.includes(ONLY)) continue;
  const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: DPR, colorScheme: SCHEME, reducedMotion: 'reduce', locale: LANG });
  const state = scene.fresh ? { 'mindtier.settings.v1': demoState()['mindtier.settings.v1'] } : demoState();
  await context.addInitScript((entries) => {
    if (sessionStorage.getItem('seeded')) return;
    for (const [k, v] of Object.entries(entries)) localStorage.setItem(k, JSON.stringify(v));
    sessionStorage.setItem('seeded', '1');
  }, state);
  const page = await context.newPage();
  page.on('pageerror', (e) => console.error(`  [${scene.name}] page error: ${e.message}`));
  await stubNetwork(page, { fresh: Boolean(scene.fresh) });
  await page.goto(`${BASE}${scene.path}`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => Boolean(globalThis.__mindtier), null, { timeout: 60_000 });
  await settle(page, 1200);
  if (scene.before) await scene.before(page);
  await hideDevOverlay(page);
  const file = join(OUT, `${scene.name}.png`);
  await page.screenshot({ path: file });
  console.log(`✓ ${scheme(file)}`);
  await context.close();
}
await browser.close();
server?.close();

function scheme(file) {
  return file.replace(root + '/', '');
}

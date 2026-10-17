#!/usr/bin/env node
// End-to-end UI test of the core loop in the real app (web build, network blocked = offline):
// welcome → 5 placement games → tier reveal → paywall → home → ranked session → results → free limit.
//   cd apps/mobile && EXPO_PUBLIC_QA_HOOKS=1 npx expo export --platform web --output-dir ../../.qa-web && cd ../..
//   node scripts/e2e-flow.mjs [--dist .qa-web]
import { createReadStream, existsSync, statSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { createServer } from 'node:http';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, process.argv.includes('--dist') ? process.argv[process.argv.indexOf('--dist') + 1] : '.qa-web');
const shots = join(root, '.qa-web-e2e');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.ttf': 'font/ttf', '.wav': 'audio/wav', '.json': 'application/json' };

const server = createServer((req, res) => {
  let file = join(dist, decodeURIComponent((req.url ?? '/').split('?')[0]));
  if (!existsSync(file) || statSync(file).isDirectory()) file = join(dist, 'index.html');
  res.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const base = `http://localhost:${server.address().port}`;

let step = 0;
const failures = [];
function check(cond, label) {
  console.log(`${cond ? '✓' : '✗'} ${label}`);
  if (!cond) failures.push(label);
}

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 412, height: 732 }, colorScheme: 'dark', reducedMotion: 'reduce' });
const page = await context.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.route(/supabase\.co|\/api\/v1\//, (r) => r.abort()); // fully offline
await mkdir(shots, { recursive: true });
const snap = (name) => page.screenshot({ path: join(shots, `${String(++step).padStart(2, '0')}-${name}.png`) });
const visible = (testId, timeout = 15_000) => page.getByTestId(testId).waitFor({ state: 'visible', timeout }).then(() => true, () => false);

async function playSession(label) {
  for (let game = 0; ; game++) {
    if (!(await visible('intro-start', 20_000))) break;
    await page.getByTestId('intro-start').click();
    // Answer every trial correctly until the between-games card appears.
    const deadline = Date.now() + 180_000;
    while (Date.now() < deadline) {
      if (await page.getByTestId('session-next').isVisible().catch(() => false)) break;
      await page.evaluate(() => globalThis.__mindtier?.answerCurrent?.());
      await page.waitForTimeout(250);
    }
    const done = await visible('session-next', 5_000);
    check(done, `${label}: game ${game + 1} completed`);
    if (!done) return false;
    await page.getByTestId('session-next').click();
  }
  return true;
}

try {
  await page.goto(base, { waitUntil: 'networkidle' });
  check(await visible('welcome-start', 60_000), 'new player lands on welcome');
  await snap('welcome');
  await page.getByTestId('welcome-start').click();

  await playSession('placement');
  check(await page.getByText('YOU PLACED').waitFor({ timeout: 10_000 }).then(() => true, () => false), 'tier reveal shown after placement');
  await snap('reveal');
  await page.getByTestId('reveal-continue').click();

  check(await visible('paywall-close'), 'paywall offered after reveal (dismissible)');
  await snap('paywall');
  await page.getByTestId('paywall-close').click();

  check(await visible('home-ranked'), 'home shows ranked session after placement');
  const state = await page.evaluate(() => JSON.parse(localStorage.getItem('mindtier.progress.v1') ?? '{}').state);
  check(state?.placementDone === true, 'placement persisted');
  check(state?.outbox?.length === 1, 'placement queued for upload while offline');
  const low = Object.entries(state?.ratings ?? {}).filter(([, r]) => r.rating <= 1300);
  check(low.length === 0, `perfect placement raised every domain above the start rating${low.length ? ` (low: ${JSON.stringify(low)})` : ''}`);
  await snap('home');

  await page.getByTestId('home-ranked').click();
  await playSession('ranked');
  check(await visible('results-done'), 'results shown after ranked session');
  await snap('results');
  await page.getByTestId('results-done').click();
  check(await page.getByText('You’ve played today’s free ranked session').waitFor({ timeout: 10_000 }).then(() => true, () => false), 'free daily limit applied');
  await snap('home-limit');

  const after = await page.evaluate(() => JSON.parse(localStorage.getItem('mindtier.progress.v1') ?? '{}').state);
  const today = Object.values(after?.activity ?? {}).reduce((n, d) => n + d.sessions, 0);
  check(after?.seasonStats?.sessions === 2 && today === 2, 'season stats and weekly activity count both sessions');
  await page.getByTestId('season-card').click();
  check(await page.getByText('Sessions', { exact: true }).waitFor({ timeout: 10_000 }).then(() => true, () => false), 'season recap opens from home');
  await snap('season');
  await page.goto(`${base}/week`, { waitUntil: 'networkidle' });
  check(await page.getByText('Days played', { exact: true }).waitFor({ timeout: 20_000 }).then(() => true, () => false), 'weekly recap shows this week');
  await snap('week');
} finally {
  check(errors.length === 0, `no uncaught page errors${errors.length ? `: ${errors.slice(0, 3).join(' | ')}` : ''}`);
  await browser.close();
  server.close();
}

console.log(failures.length ? `\n${failures.length} check(s) failed` : '\nAll E2E checks passed');
process.exit(failures.length ? 1 : 0);

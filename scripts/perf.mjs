#!/usr/bin/env node
// Performance check on a mid-range-phone proxy: the QA web export under 4x CPU throttling.
// Build once:  cd apps/mobile && EXPO_PUBLIC_QA_HOOKS=1 npx expo export --platform web --output-dir ../../.qa-web
// Then:        node scripts/perf.mjs [--dist .qa-web] [--rate 4] [--budget 400]
// Reports long tasks (main-thread blocks over 50 ms) on boot and on each screen's first and second visit,
// and frame pacing while scrolling Profile. Exits 1 if any single long task exceeds --budget ms.
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1] : fallback;
};
const dist = join(root, arg('dist', '.qa-web'));
const rate = Number(arg('rate', 4));
const budget = Number(arg('budget', 400));
if (!existsSync(join(dist, 'index.html'))) {
  console.error(`no web export at ${dist} — build it first (see the header of this file)`);
  process.exit(2);
}

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.ttf': 'font/ttf', '.wav': 'audio/wav', '.json': 'application/json' };
const server = createServer((req, res) => {
  let file = join(dist, decodeURIComponent(req.url.split('?')[0]));
  if (!existsSync(file) || statSync(file).isDirectory()) file = join(dist, 'index.html');
  res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(res);
}).listen(0);
const base = `http://localhost:${server.address().port}`;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2, reducedMotion: 'no-preference' });
const page = await ctx.newPage();
// Offline-first: every backend call fails fast, so timings measure the app, not the network.
await page.route(/supabase\.co|\/api\/v1\//, (r) => r.abort());
const cdp = await ctx.newCDPSession(page);
await cdp.send('Emulation.setCPUThrottlingRate', { rate });
await page.addInitScript(() => {
  globalThis.__longTasks = [];
  new PerformanceObserver((list) => list.getEntries().forEach((e) => globalThis.__longTasks.push(Math.round(e.duration)))).observe({ type: 'longtask', buffered: true });
});
const drain = () => page.evaluate(() => globalThis.__longTasks.splice(0));

const rows = [];
const started = Date.now();
await page.goto(`${base}/`, { waitUntil: 'load' });
await page.waitForFunction(() => globalThis.__mindtier?.router, null, { timeout: 60_000 });
rows.push(['boot', Date.now() - started, await drain()]);

// A placed player, so Home and Profile render the radar, sparklines and domain list.
await page.evaluate(() => globalThis.__mindtier.stores.useProgress.setState({ placementDone: true }));
for (const [label, path] of [['home', '/'], ['profile', '/profile'], ['daily', '/daily'], ['duels', '/duels'], ['settings', '/settings'], ['league', '/league'], ['profile (again)', '/profile'], ['home (again)', '/']]) {
  const t = Date.now();
  await page.evaluate((p) => globalThis.__mindtier.router.push(p), path);
  await page.waitForTimeout(2500);
  rows.push([label, Date.now() - t - 2500, await drain()]);
}

await page.evaluate(() => globalThis.__mindtier.router.push('/profile'));
await page.waitForTimeout(2000);
const scroll = await page.evaluate(async () => {
  const stamps = [];
  let running = true;
  const tick = (t) => {
    stamps.push(t);
    if (running) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  const scroller = [...document.querySelectorAll('div')].find((d) => d.scrollHeight > d.clientHeight + 200 && getComputedStyle(d).overflowY !== 'visible');
  for (let i = 0; i < 30; i++) {
    scroller?.scrollBy(0, 40);
    await new Promise((r) => setTimeout(r, 16));
  }
  await new Promise((r) => setTimeout(r, 300));
  running = false;
  const gaps = stamps.slice(1).map((t, i) => t - stamps[i]);
  return { frames: gaps.length, slow: gaps.filter((g) => g > 33).length, worst: Math.round(Math.max(...gaps)) };
});
await browser.close();
server.close();

console.log(`CPU throttled ${rate}x, budget ${budget} ms per long task\n`);
console.log('screen            long tasks (ms)');
for (const [label, , tasks] of rows) console.log(`${label.padEnd(18)}${tasks.length ? tasks.join(', ') : '—'}`);
console.log(`\nprofile scroll: ${scroll.frames} frames, ${scroll.slow} over 33 ms, worst ${scroll.worst} ms`);
const worst = Math.max(0, ...rows.flatMap(([, , tasks]) => tasks));
if (worst > budget) {
  console.error(`\n✗ a long task took ${worst} ms (budget ${budget} ms)`);
  process.exit(1);
}
console.log(`\n✓ worst long task ${worst} ms`);

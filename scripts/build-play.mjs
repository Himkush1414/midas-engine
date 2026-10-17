#!/usr/bin/env node
// Builds the web Daily Challenge (the Expo app in web-play mode) into
// apps/web/public/play, which the website serves at /play. Runs before
// `next build` on Vercel (apps/web/vercel.json); safe to run locally too.
// Public config is taken from the website's own environment:
// SUPABASE_URL, SUPABASE_ANON_KEY and NEXT_PUBLIC_SITE_URL (all non-secret).
import { execFileSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'apps/web/public/play');
const site = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://midas-engine.vercel.app').replace(/\/$/, '');
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '';
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY ?? '';
if (!supabaseUrl || !anonKey) console.warn('build-play: no Supabase config, the web Daily Challenge will run offline (no leaderboard)');

rmSync(out, { recursive: true, force: true });
execFileSync('npx', ['expo', 'export', '--platform', 'web', '--output-dir', out, '--clear'], {
  cwd: join(root, 'apps/mobile'),
  stdio: 'inherit',
  env: {
    ...process.env,
    WEB_BASE_URL: '/play',
    EXPO_PUBLIC_WEB_PLAY: '1',
    EXPO_PUBLIC_WEB_URL: site,
    EXPO_PUBLIC_API_URL: site,
    EXPO_PUBLIC_SUPABASE_URL: supabaseUrl,
    EXPO_PUBLIC_SUPABASE_ANON_KEY: anonKey,
  },
});
console.log(`build-play: web Daily Challenge written to ${out.replace(root + '/', '')}`);

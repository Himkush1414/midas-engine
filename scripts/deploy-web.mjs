#!/usr/bin/env node
// Deploys the current HEAD of main to Vercel production through the API.
// Git-triggered deploys are disabled (vercel.json) to stay within plan limits;
// run this when web-facing code changes. Reads VERCEL_TOKEN from the environment,
// and refuses to deploy while supabase/migrations has files not yet applied.
import { execSync } from 'node:child_process';
import { readdirSync } from 'node:fs';

const token = process.env.VERCEL_TOKEN;
if (!token) {
  console.error('VERCEL_TOKEN is required');
  process.exit(1);
}
const TEAM = 'team_sgzxInxBZ6nYL4qjjCnVOgSN';
const PROJECT = 'prj_TaKNJlahX0KZeR4V0BTijR3Oc3pr';
const REPO_ID = 1421640714;
const sha = execSync('git rev-parse HEAD').toString().trim();

// The API reads the schema the migrations create, so never ship code ahead of
// the database. Same tracking table as scripts/db-migrate.mjs.
if (!process.argv.includes('--skip-migration-check')) {
  const supaToken = process.env.SUPABASE_ACCESS_TOKEN;
  const supaUrl = process.env.SUPABASE_PROJECT_URL;
  if (!supaToken || !supaUrl) {
    console.error('SUPABASE_ACCESS_TOKEN and SUPABASE_PROJECT_URL are required to check migrations (or pass --skip-migration-check)');
    process.exit(1);
  }
  const ref = new URL(supaUrl).hostname.split('.')[0];
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${supaToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'select name from public.supabase_migrations_applied' }),
  });
  if (!res.ok) {
    console.error(`could not read applied migrations: HTTP ${res.status}`);
    process.exit(1);
  }
  const applied = new Set((await res.json()).map((r) => r.name));
  const files = readdirSync(new URL('../supabase/migrations/', import.meta.url)).filter((f) => f.endsWith('.sql'));
  const pending = files.filter((f) => !applied.has(f)).sort();
  if (pending.length > 0) {
    console.error(`pending migrations: ${pending.join(', ')}\nrun \`node scripts/db-migrate.mjs\` first`);
    process.exit(1);
  }
}
const api = (path, init = {}) =>
  fetch(`https://api.vercel.com${path}${path.includes('?') ? '&' : '?'}teamId=${TEAM}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(init.headers ?? {}) },
  }).then((r) => r.json());

const created = await api('/v13/deployments', {
  method: 'POST',
  body: JSON.stringify({
    name: 'midas-engine',
    project: PROJECT,
    target: 'production',
    gitSource: { type: 'github', repoId: REPO_ID, ref: 'main', sha },
  }),
});
if (created.error) {
  console.error('deploy failed:', created.error.message);
  process.exit(1);
}
console.log(`deploying ${sha.slice(0, 7)} → ${created.url}`);

const deadline = Date.now() + 15 * 60_000;
for (;;) {
  const d = await api(`/v13/deployments/${created.id}`);
  if (d.readyState === 'READY') {
    console.log('✓ ready:', `https://${d.url}`);
    break;
  }
  if (d.readyState === 'ERROR' || d.readyState === 'CANCELED') {
    console.error(`✗ ${d.readyState}:`, d.errorMessage ?? 'see Vercel build logs');
    process.exit(1);
  }
  if (Date.now() > deadline) {
    console.error('timed out waiting for deployment');
    process.exit(1);
  }
  await new Promise((r) => setTimeout(r, 8000));
}

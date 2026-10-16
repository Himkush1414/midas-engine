#!/usr/bin/env node
// Applies pending SQL migrations in supabase/migrations to the linked project
// through the Supabase Management API. Tracks applied files in
// supabase_migrations_applied. Reads SUPABASE_ACCESS_TOKEN and
// SUPABASE_PROJECT_URL from the environment (never from committed files).
// Usage: node scripts/db-migrate.mjs [--dry-run]
import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const token = process.env.SUPABASE_ACCESS_TOKEN;
const url = process.env.SUPABASE_PROJECT_URL;
if (!token || !url) {
  console.error('SUPABASE_ACCESS_TOKEN and SUPABASE_PROJECT_URL are required');
  process.exit(1);
}
const ref = new URL(url).hostname.split('.')[0];
const dryRun = process.argv.includes('--dry-run');

async function query(sql) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sql }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);
  return text ? JSON.parse(text) : [];
}

await query(`create table if not exists public.supabase_migrations_applied (
  name text primary key, applied_at timestamptz not null default now()
); alter table public.supabase_migrations_applied enable row level security;`);

const applied = new Set((await query('select name from public.supabase_migrations_applied')).map((r) => r.name));
const files = (await readdir(join(root, 'supabase/migrations'))).filter((f) => f.endsWith('.sql')).sort();
const pending = files.filter((f) => !applied.has(f));

if (pending.length === 0) {
  console.log('Database is up to date.');
  process.exit(0);
}

for (const file of pending) {
  const sql = await readFile(join(root, 'supabase/migrations', file), 'utf8');
  if (dryRun) {
    console.log(`would apply ${file}`);
    continue;
  }
  const name = file.replace(/'/g, "''");
  await query(`begin;\n${sql}\ninsert into public.supabase_migrations_applied (name) values ('${name}');\ncommit;`);
  console.log(`✓ applied ${file}`);
}

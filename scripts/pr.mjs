#!/usr/bin/env node
// Pull-request workflow through the GitHub REST API (no gh CLI needed).
//   node scripts/pr.mjs open <branch> "<type(scope): title>" "<body>" [pathspec...]
//     commits the staged paths (or everything) on a new branch from HEAD, pushes it and opens a PR into main.
//     Stays on the new branch, so the next change can build on it.
//   node scripts/pr.mjs merge <number>
//     waits for every CI check on the PR head to finish, merges it (merge commit) if all passed,
//     and deletes the branch. Exits non-zero if a check fails.
// Reads GITHUB_TOKEN from .env.local through the environment; the token is never printed or written.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const REPO = 'Himkush1414/midas-engine';
const AUTHOR = { name: 'Himkush1414', email: 'light.dark14143@gmail.com' };

if (!process.env.GITHUB_TOKEN) {
  for (const line of readFileSync(join(root, '.env.local'), 'utf8').split('\n')) {
    const m = /^GITHUB_TOKEN=(.*)$/.exec(line.trim());
    if (m) process.env.GITHUB_TOKEN = m[1].replace(/^['"]|['"]$/g, '');
  }
}
const token = process.env.GITHUB_TOKEN;
if (!token) throw new Error('GITHUB_TOKEN is required');

const scrub = (s) => String(s).replaceAll(token, '***');
const git = (...args) =>
  execFileSync('git', ['-c', 'credential.helper=', '-c', 'credential.helper=!f() { echo username=x-access-token; echo "password=${GITHUB_TOKEN}"; }; f', ...args], {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();

async function api(path, init = {}) {
  const res = await fetch(`https://api.github.com/repos/${REPO}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
  });
  const body = res.status === 204 ? null : await res.json();
  if (!res.ok) throw new Error(`${init.method ?? 'GET'} ${path}: HTTP ${res.status} ${scrub(JSON.stringify(body))}`);
  return body;
}

async function open(branch, title, body, paths) {
  if (!branch || !title) throw new Error('usage: open <branch> <title> <body> [paths...]');
  git('config', 'user.name', AUTHOR.name);
  git('config', 'user.email', AUTHOR.email);
  git('checkout', '-b', branch);
  git('add', '--', ...(paths.length ? paths : ['.']));
  const staged = git('diff', '--cached', '--name-only');
  if (!staged) throw new Error('nothing staged');
  if (/(^|\/)(\.env(\..*)?|MIDAS_PRIVATE_NOTES\.md)$/m.test(staged.split('\n').filter((f) => !f.endsWith('.env.example')).join('\n'))) {
    throw new Error('refusing to commit a secret or private file');
  }
  git('commit', '-q', '-m', `${title}\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`);
  git('push', '-q', '-u', 'origin', branch);
  const pr = await api('/pulls', {
    method: 'POST',
    body: JSON.stringify({ title, head: branch, base: 'main', body: `${body}\n\n🤖 Generated with [Claude Code](https://claude.com/claude-code)` }),
  });
  console.log(`opened #${pr.number} ${pr.html_url} (${git('rev-parse', '--short', 'HEAD')})`);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function merge(number) {
  const deadline = Date.now() + 60 * 60_000;
  let pr = await api(`/pulls/${number}`);
  for (;;) {
    pr = await api(`/pulls/${number}`);
    const { check_runs: runs } = await api(`/commits/${pr.head.sha}/check-runs?per_page=100`);
    const pending = runs.filter((r) => r.status !== 'completed');
    const failed = runs.filter((r) => r.status === 'completed' && !['success', 'skipped', 'neutral'].includes(r.conclusion));
    if (failed.length) {
      console.error(`#${number} CI failed: ${failed.map((r) => `${r.name}=${r.conclusion} ${r.html_url}`).join(', ')}`);
      process.exit(1);
    }
    if (runs.length >= 3 && pending.length === 0 && pr.mergeable !== null) break;
    if (Date.now() > deadline) throw new Error(`#${number}: CI still running after 60 minutes`);
    await sleep(20_000);
  }
  if (!pr.mergeable) throw new Error(`#${number} is not mergeable (${pr.mergeable_state})`);
  const res = await api(`/pulls/${number}/merge`, {
    method: 'PUT',
    body: JSON.stringify({ merge_method: 'merge', sha: pr.head.sha }),
  });
  await api(`/git/refs/heads/${pr.head.ref}`, { method: 'DELETE' });
  console.log(`merged #${number} → ${res.sha.slice(0, 7)}, deleted ${pr.head.ref}`);
}

const [cmd, ...args] = process.argv.slice(2);
if (cmd === 'open') await open(args[0], args[1], args[2] ?? '', args.slice(3));
else if (cmd === 'merge') await merge(Number(args[0]));
else {
  console.error('usage: pr.mjs open|merge …');
  process.exit(2);
}

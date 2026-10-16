/**
 * End-to-end smoke test against a running API and the real Supabase project.
 * Skipped unless API_SMOKE_URL, SUPABASE_URL and SUPABASE_ANON_KEY are set.
 *   API_SMOKE_URL=http://localhost:3100 npx vitest run src/server/api.smoke.test.ts
 */
import { GAMES, GameRun, dailyPlan, gameSeed, placementPlan, toSubmission, utcDayKey, type SessionPlan } from '@mindtier/core';
import { randomUUID } from 'node:crypto';
import { afterAll, describe, expect, it } from 'vitest';

const API = process.env.API_SMOKE_URL;
const SUPA = process.env.SUPABASE_URL;
const ANON = process.env.SUPABASE_ANON_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const enabled = Boolean(API && SUPA && ANON);

function play(plan: SessionPlan) {
  return plan.games.map((id, i) => {
    const def = GAMES[id];
    const run = new GameRun(def, { mode: plan.mode, seed: gameSeed(plan, i), rating: 1300 });
    let n = 0;
    while (!run.done) run.submit(n++ % 4 === 3 ? null : def.solve(run.currentTrial()), def.minHumanRtMs + 450);
    return toSubmission(run.summary());
  });
}

describe.skipIf(!enabled)('API smoke', { timeout: 60_000 }, () => {
  let token = '';
  let userId = '';
  const seed = `smoke-${randomUUID()}`;
  const call = (path: string, init: RequestInit = {}) =>
    fetch(`${API}${path}`, {
      ...init,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(init.headers ?? {}) },
    });

  afterAll(async () => {
    if (SERVICE && userId) {
      await fetch(`${SUPA}/auth/v1/admin/users/${userId}`, { method: 'DELETE', headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` } });
    }
  });

  it('signs up anonymously', async () => {
    const res = await fetch(`${SUPA}/auth/v1/signup`, { method: 'POST', headers: { apikey: ANON!, 'Content-Type': 'application/json' }, body: '{}' });
    const body = await res.json();
    token = body.access_token;
    userId = body.user.id;
    expect(token).toBeTruthy();
  });

  it('rejects requests without a token', async () => {
    const res = await fetch(`${API}/api/v1/bootstrap`, { method: 'POST', body: JSON.stringify({ seed }) });
    expect(res.status).toBe(401);
  });

  it('bootstraps a profile with starting ratings', async () => {
    const res = await call('/api/v1/bootstrap', { method: 'POST', body: JSON.stringify({ seed }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.profile.seed).toBe(seed);
    expect(body.ratings.memory.rating).toBe(1300);
    expect(body.isPro).toBe(false);
  });

  it('records a verified placement, idempotently', async () => {
    const plan = placementPlan(seed);
    const payload = { id: randomUUID(), mode: 'placement', seed: plan.seed, games: plan.games, sessionIndex: null, runs: play(plan) };
    const first = await call('/api/v1/sessions', { method: 'POST', body: JSON.stringify(payload) });
    expect(first.status).toBe(200);
    const body = await first.json();
    expect(body.status).toBe('ok');
    expect(body.updates).toHaveLength(5);
    const again = await call('/api/v1/sessions', { method: 'POST', body: JSON.stringify(payload) });
    expect((await again.json()).status).toBe('duplicate');
    const second = await call('/api/v1/sessions', { method: 'POST', body: JSON.stringify({ ...payload, id: randomUUID() }) });
    expect(second.status).toBe(409);
  });

  it('rejects a forged plan', async () => {
    const plan = placementPlan('not-my-seed');
    const payload = { id: randomUUID(), mode: 'placement', seed: plan.seed, games: plan.games, sessionIndex: null, runs: play(plan) };
    const res = await call('/api/v1/sessions', { method: 'POST', body: JSON.stringify(payload) });
    expect(res.status).toBe(422);
  });

  it('records the daily challenge and shows it on the board', async () => {
    const day = utcDayKey(new Date());
    const plan = dailyPlan(day);
    const payload = { id: randomUUID(), mode: 'daily', seed: plan.seed, games: plan.games, sessionIndex: null, runs: play(plan) };
    const res = await call('/api/v1/sessions', { method: 'POST', body: JSON.stringify(payload) });
    expect(res.status).toBe(200);
    const board = await (await call(`/api/v1/daily/${day}`)).json();
    expect(board.total).toBeGreaterThanOrEqual(1);
    expect(board.me.points).toBeGreaterThan(0);
  });
});

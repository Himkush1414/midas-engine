import {
  GAMES,
  GameRun,
  dailyPlan,
  duelPlan,
  focusPlan,
  gameSeed,
  initialRatings,
  placementPlan,
  rankedPlan,
  toSubmission,
  type SessionPlan,
} from '@mindtier/core';
import { describe, expect, it } from 'vitest';
import { validateSession, type SessionUpload } from './validate-session';

const SEED = 'profile-seed-123';
const NOW = new Date('2026-10-16T12:00:00Z');

function play(plan: SessionPlan, good = true) {
  return plan.games.map((id, i) => {
    const def = GAMES[id];
    const run = new GameRun(def, { mode: plan.mode, seed: gameSeed(plan, i), rating: 1300 });
    while (!run.done) run.submit(good ? def.solve(run.currentTrial()) : null, def.minHumanRtMs + 400);
    return toSubmission(run.summary());
  });
}

function upload(plan: SessionPlan, extra: Partial<SessionUpload> = {}): SessionUpload {
  return {
    id: '11111111-1111-4111-8111-111111111111',
    mode: plan.mode as SessionUpload['mode'],
    seed: plan.seed,
    games: plan.games,
    sessionIndex: null,
    runs: play(plan),
    ...extra,
  };
}

const ctx = { profileSeed: SEED, now: NOW, ratings: initialRatings() };

describe('validateSession', () => {
  it('accepts an honest placement and raises ratings', () => {
    const r = validateSession(upload(placementPlan(SEED)), ctx);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.update!.updates).toHaveLength(5);
  });

  it('rejects a placement built from someone else’s seed', () => {
    const r = validateSession(upload(placementPlan('another-seed')), ctx);
    expect(r).toMatchObject({ ok: false, status: 422 });
  });

  it('accepts ranked sessions on the profile’s seed and index', () => {
    const plan = rankedPlan(SEED, 7, initialRatings());
    const r = validateSession(upload(plan, { sessionIndex: 7 }), ctx);
    expect(r.ok).toBe(true);
  });

  it('rejects a ranked session whose index does not match its seed', () => {
    const plan = rankedPlan(SEED, 7, initialRatings());
    expect(validateSession(upload(plan, { sessionIndex: 8 }), ctx)).toMatchObject({ ok: false, status: 422 });
  });

  it('accepts focus sessions within one domain', () => {
    const plan = focusPlan(SEED, 3, 'logic');
    expect(validateSession(upload(plan, { sessionIndex: 3 }), ctx).ok).toBe(true);
  });

  it('accepts today’s and yesterday’s daily, rejects older ones', () => {
    expect(validateSession(upload(dailyPlan('2026-10-16')), ctx).ok).toBe(true);
    expect(validateSession(upload(dailyPlan('2026-10-15')), ctx).ok).toBe(true);
    expect(validateSession(upload(dailyPlan('2026-10-10')), ctx)).toMatchObject({ ok: false, status: 410 });
  });

  it('does not rate daily sessions', () => {
    const r = validateSession(upload(dailyPlan('2026-10-16')), ctx);
    expect(r.ok && r.update).toBeNull();
    expect(r.ok && r.points).toBeGreaterThan(0);
  });

  it('checks duels exist and are live', () => {
    const plan = duelPlan('abcd1234');
    const live = { ...ctx, duel: { id: 'abcd1234', expiresAt: new Date('2026-10-20T00:00:00Z') } };
    expect(validateSession(upload(plan), live).ok).toBe(true);
    expect(validateSession(upload(plan), ctx)).toMatchObject({ ok: false, status: 404 });
    const expired = { ...ctx, duel: { id: 'abcd1234', expiresAt: new Date('2026-10-01T00:00:00Z') } };
    expect(validateSession(upload(plan), expired)).toMatchObject({ ok: false, status: 410 });
  });

  it('rejects swapped games and doctored runs', () => {
    const plan = placementPlan(SEED);
    const u = upload(plan);
    const swapped = { ...u, runs: [u.runs[1]!, u.runs[0]!, ...u.runs.slice(2)] };
    expect(validateSession(swapped, ctx)).toMatchObject({ ok: false, status: 422 });
    const doctored = structuredClone(u);
    doctored.runs[0]!.trials[2]!.level += 3;
    expect(validateSession(doctored, ctx)).toMatchObject({ ok: false, status: 422 });
  });

  it('rejects zen uploads and mismatched run counts', () => {
    const plan = placementPlan(SEED);
    expect(validateSession({ ...upload(plan), mode: 'zen' as never }, ctx)).toMatchObject({ ok: false, status: 400 });
    expect(validateSession({ ...upload(plan), runs: [] }, ctx)).toMatchObject({ ok: false, status: 400 });
  });
});

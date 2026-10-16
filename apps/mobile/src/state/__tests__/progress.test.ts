import { GAMES, GameRun, dailyPlan, placementPlan, rankedPlan, zenPlan, type SessionPlan } from '@mindtier/core';
import { useProgress } from '../progress';

function playPlan(plan: SessionPlan, rating = 1300) {
  return plan.games.map((id, i) => {
    const def = GAMES[id];
    const run = new GameRun(def, { mode: plan.mode, seed: `${plan.seed}|${i}`, rating });
    while (!run.done) run.submit(def.solve(run.currentTrial()), def.minHumanRtMs + 200);
    return run.summary();
  });
}

const day = new Date('2026-10-16T12:00:00Z');

beforeEach(() => useProgress.getState().resetAll());

describe('progress store', () => {
  it('completes placement and raises every domain for a perfect player', () => {
    const plan = placementPlan(useProgress.getState().userSeed);
    const before = useProgress.getState().ratings;
    const result = useProgress.getState().completeSession(plan, playPlan(plan), day);
    const s = useProgress.getState();
    expect(s.placementDone).toBe(true);
    expect(result.updates).toHaveLength(5);
    for (const u of result.updates) expect(s.ratings[u.domain].rating).toBeGreaterThan(before[u.domain].rating);
    expect(s.outbox).toHaveLength(1);
    expect(s.streak.current).toBe(1);
  });

  it('counts ranked usage per UTC day and advances the session index', () => {
    const s0 = useProgress.getState();
    const plan = rankedPlan(s0.userSeed, s0.rankedSessionIndex, s0.ratings);
    s0.completeSession(plan, playPlan(plan), day);
    const s1 = useProgress.getState();
    expect(s1.rankedSessionIndex).toBe(1);
    expect(s1.usageToday(day).rankedSessions).toBe(1);
    expect(s1.usageToday(new Date('2026-10-17T00:00:01Z')).rankedSessions).toBe(0);
    expect(s1.outbox[0]?.sessionIndex).toBe(0);
  });

  it('stores the daily result and does not move ratings for fixed modes', () => {
    const plan = dailyPlan('2026-10-16');
    const before = useProgress.getState().ratings;
    useProgress.getState().completeSession(plan, playPlan(plan), day);
    const s = useProgress.getState();
    expect(s.daily['2026-10-16']?.points).toBeGreaterThan(0);
    expect(s.ratings).toEqual(before);
  });

  it('keeps zen sessions out of the outbox and the streak', () => {
    const plan = zenPlan('echo', 'z');
    useProgress.getState().completeSession(plan, playPlan(plan), day);
    const s = useProgress.getState();
    expect(s.outbox).toHaveLength(0);
    expect(s.streak.current).toBe(0);
    expect(s.gamesPlayed).toBe(1);
  });

  it('removes uploaded outbox items', () => {
    const plan = dailyPlan('2026-10-16');
    useProgress.getState().completeSession(plan, playPlan(plan), day);
    const id = useProgress.getState().outbox[0]!.id;
    useProgress.getState().bumpOutboxAttempt(id);
    expect(useProgress.getState().outbox[0]!.attempts).toBe(1);
    useProgress.getState().dropOutboxItem(id);
    expect(useProgress.getState().outbox).toHaveLength(0);
  });
});

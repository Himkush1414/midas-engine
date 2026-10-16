import { GAMES, GameRun, dailyPlan, initialRatings, newRating, placementPlan, type SessionPlan } from '@mindtier/core';
import { ApiError, api } from '@/lib/api';
import { useProgress } from '@/state/progress';
import { syncNow } from '../sync';

jest.mock('@/lib/config', () => ({ backendConfigured: true, config: { apiUrl: 'http://test', supabaseUrl: 'x', supabaseAnonKey: 'y', sentryDsn: '' } }));
jest.mock('@/lib/api', () => {
  const actual = jest.requireActual('@/lib/api');
  return { ...actual, api: { bootstrap: jest.fn(), submitSession: jest.fn(), sendEvents: jest.fn(async () => ({ accepted: 0 })) } };
});

const mocked = api as jest.Mocked<typeof api>;

function play(plan: SessionPlan) {
  return plan.games.map((id, i) => {
    const def = GAMES[id];
    const run = new GameRun(def, { mode: plan.mode, seed: `${plan.seed}|${i}`, rating: 1300 });
    while (!run.done) run.submit(def.solve(run.currentTrial()), 900);
    return run.summary();
  });
}

const serverRatings = () => ({ ...initialRatings(), logic: newRating(1777, 80) });

function boot(over: Partial<Awaited<ReturnType<typeof api.bootstrap>>> = {}) {
  mocked.bootstrap.mockResolvedValue({
    profile: { id: 'u1', seed: useProgress.getState().userSeed, displayName: null },
    ratings: serverRatings(),
    isPro: false,
    usage: { rankedSessions: 0, duelsCreated: 0 },
    nextSessionIndex: 0,
    placementDone: false,
    ...over,
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  useProgress.getState().resetAll();
});

describe('syncNow', () => {
  it('uploads the outbox and adopts the authoritative ratings', async () => {
    const plan = placementPlan(useProgress.getState().userSeed);
    useProgress.getState().completeSession(plan, play(plan));
    boot();
    mocked.submitSession.mockResolvedValue({ status: 'ok', ratings: serverRatings() });
    const r = await syncNow();
    expect(r).toMatchObject({ status: 'ok', uploaded: 1, pending: 0 });
    expect(useProgress.getState().outbox).toHaveLength(0);
    expect(useProgress.getState().ratings.logic.rating).toBe(1777);
  });

  it('drops permanently rejected sessions and keeps going', async () => {
    const day = dailyPlan('2026-10-16');
    useProgress.getState().completeSession(day, play(day));
    useProgress.getState().completeSession(day, play(day));
    boot();
    mocked.submitSession.mockRejectedValueOnce(new ApiError(410, 'closed')).mockResolvedValueOnce({ status: 'ok', ratings: serverRatings() });
    const r = await syncNow();
    expect(r).toMatchObject({ status: 'ok', uploaded: 1, dropped: 1, pending: 0 });
  });

  it('keeps sessions on network failure and does not overwrite local ratings', async () => {
    const plan = placementPlan(useProgress.getState().userSeed);
    const before = useProgress.getState().completeSession(plan, play(plan)).ratings;
    boot();
    mocked.submitSession.mockRejectedValue(new ApiError(0, 'offline'));
    const r = await syncNow();
    expect(r).toMatchObject({ status: 'ok', uploaded: 0, pending: 1 });
    expect(useProgress.getState().outbox[0]!.attempts).toBe(1);
    expect(useProgress.getState().ratings).toEqual(before);
  });

  it('adopts the server seed and never reuses a ranked index', async () => {
    useProgress.setState({ rankedSessionIndex: 2 });
    boot({ profile: { id: 'u1', seed: 'server-seed-abc', displayName: null }, nextSessionIndex: 9, placementDone: true });
    await syncNow();
    const s = useProgress.getState();
    expect(s.userSeed).toBe('server-seed-abc');
    expect(s.rankedSessionIndex).toBe(9);
    expect(s.placementDone).toBe(true);
  });

  it('reports errors instead of throwing', async () => {
    mocked.bootstrap.mockRejectedValue(new ApiError(0, 'offline'));
    await expect(syncNow()).resolves.toMatchObject({ status: 'error' });
  });
});

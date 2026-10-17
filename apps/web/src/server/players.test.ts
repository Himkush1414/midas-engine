import { DOMAINS, SEASON_RD } from '@mindtier/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

interface Row {
  domain: string;
  rating: number;
  rd: number;
  volatility: number;
}
const db = { rows: [] as Row[], rollApplied: true, rpc: vi.fn() };

vi.mock('./supabase', () => ({
  supabaseAdmin: () => ({
    from: () => ({ select: () => ({ eq: async () => ({ data: db.rows, error: null }) }) }),
    rpc: db.rpc,
  }),
}));

const { currentRatings } = await import('./players');
const NOV = new Date('2026-11-03T10:00:00Z'); // season 1

beforeEach(() => {
  db.rows = [{ domain: 'memory', rating: 2000, rd: 50, volatility: 0.06 }];
  db.rpc.mockReset().mockImplementation(async () => ({ data: db.rollApplied, error: null }));
});

describe('currentRatings', () => {
  it('leaves ratings from the current season alone', async () => {
    const profile = { id: 'u', seed: 'seed-1234', display_name: null, rating_season: 1 };
    const r = await currentRatings(profile, NOV);
    expect(r.memory.rating).toBe(2000);
    expect(db.rpc).not.toHaveBeenCalled();
  });

  it('applies and stores the soft reset once a new season starts', async () => {
    const profile = { id: 'u', seed: 'seed-1234', display_name: null, rating_season: 0 };
    const r = await currentRatings(profile, NOV);
    expect(r.memory.rating).toBeCloseTo(1930);
    expect(r.memory.rd).toBe(SEASON_RD);
    expect(profile.rating_season).toBe(1);
    expect(db.rpc).toHaveBeenCalledTimes(1);
    const [name, args] = db.rpc.mock.calls[0]!;
    expect(name).toBe('roll_season');
    expect(args).toMatchObject({ p_user: 'u', p_season: 1 });
    expect(args.p_ratings).toHaveLength(DOMAINS.length);
  });

  it('re-reads stored ratings when another request rolled the season first', async () => {
    db.rollApplied = false;
    const profile = { id: 'u', seed: 'seed-1234', display_name: null, rating_season: 0 };
    const r = await currentRatings(profile, NOV);
    expect(r.memory.rating).toBe(2000);
    db.rollApplied = true;
  });
});

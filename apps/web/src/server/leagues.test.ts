import { DOMAINS, newRating, type DomainRatings } from '@mindtier/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const db = {
  rpc: vi.fn(),
  updates: [] as unknown[],
  deletes: [] as Array<Record<string, unknown>>,
};

vi.mock('./supabase', () => ({
  supabaseAdmin: () => ({
    rpc: db.rpc,
    from: (table: string) => ({
      update: (values: unknown) => ({
        eq: async () => {
          db.updates.push({ table, values });
          return { error: null };
        },
      }),
      delete: () => {
        const filter: Record<string, unknown> = { table };
        const chain = {
          eq: (col: string, v: unknown) => {
            filter[col] = v;
            if (Object.keys(filter).length === 3) {
              db.deletes.push(filter);
              return Promise.resolve({ error: null });
            }
            return chain;
          },
        };
        return chain;
      },
    }),
  }),
}));

const { leagueView, recordLeagueSession, setLeagueOptIn } = await import('./leagues');

const WED = new Date('2026-10-21T12:00:00Z'); // league week 2026-10-19
const profile = (optIn: boolean) => ({ id: 'u', seed: 'seed-1234', display_name: 'Ada', rating_season: 0, league_opt_in: optIn });
const gold = Object.fromEntries(DOMAINS.map((d) => [d, newRating(1350, 60)])) as DomainRatings;
const group = (week: string, me: { place: number; points: number }) => ({
  week,
  band: 3,
  size: 12,
  members: [{ ...me, name: 'Ada', days: 3, me: true }],
});

beforeEach(() => {
  db.rpc.mockReset();
  db.updates = [];
  db.deletes = [];
});

describe('league view', () => {
  it('stays empty for players who have not opted in', async () => {
    const v = await leagueView(profile(false), WED);
    expect(v).toEqual({ optedIn: false, week: '2026-10-19', endsAt: '2026-10-26T00:00:00.000Z', group: null, lastWeek: null });
    expect(db.rpc).not.toHaveBeenCalled();
  });

  it('returns this week’s table and last week’s finish', async () => {
    db.rpc.mockImplementation(async (_name: string, args: { p_week: string }) => ({
      data: args.p_week === '2026-10-19' ? group('2026-10-19', { place: 2, points: 1800 }) : group('2026-10-12', { place: 4, points: 2500 }),
      error: null,
    }));
    const v = await leagueView(profile(true), WED);
    expect(v.group?.members[0]).toMatchObject({ place: 2, me: true });
    expect(v.lastWeek).toEqual({ place: 4, size: 12, points: 2500 });
  });

  it('has no last-week result when the player sat it out', async () => {
    db.rpc.mockImplementation(async () => ({ data: null, error: null }));
    const v = await leagueView(profile(true), WED);
    expect(v).toMatchObject({ optedIn: true, group: null, lastWeek: null });
  });
});

describe('recording sessions', () => {
  it('sends the week, day, tier band and points', async () => {
    db.rpc.mockResolvedValue({ data: { counted: true }, error: null });
    await recordLeagueSession(profile(true), { now: WED, day: '2026-10-21', points: 950, ratings: gold });
    expect(db.rpc).toHaveBeenCalledWith('league_record', { p_user: 'u', p_week: '2026-10-19', p_day: '2026-10-21', p_band: 3, p_points: 950 });
  });

  it('skips players who have not opted in', async () => {
    await recordLeagueSession(profile(false), { now: WED, day: '2026-10-21', points: 950, ratings: gold });
    expect(db.rpc).not.toHaveBeenCalled();
  });

  it('never fails the upload when the league write fails', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    db.rpc.mockResolvedValue({ data: null, error: new Error('db down') });
    await expect(recordLeagueSession(profile(true), { now: WED, day: '2026-10-21', points: 1, ratings: gold })).resolves.toBeUndefined();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});

describe('opting in and out', () => {
  it('leaving removes the player from this week’s table', async () => {
    const p = profile(true);
    await setLeagueOptIn(p, false, WED);
    expect(p.league_opt_in).toBe(false);
    expect(db.updates).toEqual([{ table: 'profiles', values: { league_opt_in: false } }]);
    expect(db.deletes).toEqual([{ table: 'league_members', user_id: 'u', week: '2026-10-19' }]);
  });

  it('joining only sets the flag', async () => {
    await setLeagueOptIn(profile(false), true, WED);
    expect(db.deletes).toEqual([]);
  });
});

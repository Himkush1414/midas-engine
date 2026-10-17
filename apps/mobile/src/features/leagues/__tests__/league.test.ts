import { ApiError, api, type LeagueView } from '@/lib/api';
import { leagueDaysLeft, myRow, useLeague } from '../league';

jest.mock('@/lib/config', () => ({ backendConfigured: true, config: { apiUrl: 'http://test', supabaseUrl: 'x', supabaseAnonKey: 'y', sentryDsn: '' } }));
jest.mock('@/features/sync/sync', () => ({ syncNow: jest.fn(async () => ({ status: 'ok', uploaded: 0, dropped: 0, pending: 0 })) }));
jest.mock('@/lib/api', () => {
  const actual = jest.requireActual('@/lib/api');
  return { ...actual, api: { league: jest.fn(), setLeagueOptIn: jest.fn() } };
});

const mocked = api as jest.Mocked<typeof api>;
const view = (optedIn: boolean, withGroup = false): LeagueView => ({
  optedIn,
  week: '2026-10-19',
  endsAt: '2026-10-26T00:00:00.000Z',
  group: withGroup
    ? {
        week: '2026-10-19',
        band: 3,
        size: 2,
        members: [
          { place: 1, name: 'Bo', points: 2000, days: 2, me: false },
          { place: 2, name: 'Ada', points: 1500, days: 2, me: true },
        ],
      }
    : null,
  lastWeek: null,
});

beforeEach(() => useLeague.setState({ view: null, loading: false, offline: false }));

describe('league helpers', () => {
  it('counts the days left in the week, at least one', () => {
    expect(leagueDaysLeft('2026-10-26T00:00:00.000Z', new Date('2026-10-21T12:00:00Z'))).toBe(5);
    expect(leagueDaysLeft('2026-10-26T00:00:00.000Z', new Date('2026-10-25T23:00:00Z'))).toBe(1);
    expect(leagueDaysLeft('2026-10-26T00:00:00.000Z', new Date('2026-10-27T00:00:00Z'))).toBe(1);
  });

  it('finds the player’s own row', () => {
    expect(myRow(view(true, true))?.name).toBe('Ada');
    expect(myRow(view(true))).toBeNull();
    expect(myRow(null)).toBeNull();
  });
});

describe('league store', () => {
  it('loads the table', async () => {
    mocked.league.mockResolvedValueOnce(view(true, true));
    await useLeague.getState().refresh();
    expect(useLeague.getState()).toMatchObject({ loading: false, offline: false });
    expect(useLeague.getState().view?.group?.size).toBe(2);
  });

  it('keeps the last table and flags offline when a refresh fails', async () => {
    useLeague.setState({ view: view(true, true) });
    mocked.league.mockRejectedValueOnce(new ApiError(0, 'network error'));
    await useLeague.getState().refresh();
    expect(useLeague.getState().offline).toBe(true);
    expect(useLeague.getState().view?.group).not.toBeNull();
  });

  it('joins and leaves', async () => {
    mocked.setLeagueOptIn.mockResolvedValueOnce(view(true));
    expect(await useLeague.getState().setOptIn(true)).toBe(true);
    expect(mocked.setLeagueOptIn).toHaveBeenLastCalledWith(true);
    expect(useLeague.getState().view?.optedIn).toBe(true);
    mocked.setLeagueOptIn.mockRejectedValueOnce(new ApiError(0, 'offline'));
    expect(await useLeague.getState().setOptIn(false)).toBe(false);
    expect(useLeague.getState().view?.optedIn).toBe(true);
  });
});

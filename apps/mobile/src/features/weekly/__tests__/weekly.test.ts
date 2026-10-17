import { localDayKey, type RatingPoint } from '@/state/progress';
import { weekRange, weeklyRecap, weeklyRecapTime } from '../weekly';

// Local times: the week follows the player's own calendar.
const at = (y: number, m: number, d: number, h = 12) => new Date(y, m - 1, d, h);
const WED = at(2026, 10, 14); // Wednesday 14 October 2026

describe('week range', () => {
  it('runs Monday to Monday around any day', () => {
    const w = weekRange(WED);
    expect(w.start).toEqual(at(2026, 10, 12, 0));
    expect(w.end).toEqual(at(2026, 10, 19, 0));
    expect(w.days).toEqual(['2026-10-12', '2026-10-13', '2026-10-14', '2026-10-15', '2026-10-16', '2026-10-17', '2026-10-18']);
  });

  it('treats Sunday as the last day and Monday as the first', () => {
    expect(weekRange(at(2026, 10, 18, 23)).days[0]).toBe('2026-10-12');
    expect(weekRange(at(2026, 10, 19, 0)).days[0]).toBe('2026-10-19');
  });

  it('steps back to last week and across months', () => {
    expect(weekRange(WED, -1).days[0]).toBe('2026-10-05');
    expect(weekRange(at(2026, 11, 1), 0).days).toContain('2026-10-31');
  });

  it('keeps whole local days across a daylight-saving change', () => {
    const w = weekRange(at(2026, 10, 25, 1));
    expect(w.days).toEqual(['2026-10-19', '2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23', '2026-10-24', '2026-10-25']);
    expect(w.end).toEqual(at(2026, 10, 26, 0));
    expect(weeklyRecapTime(at(2026, 10, 25, 1))).toEqual(at(2026, 10, 25, 18));
  });

  it('fires the recap on Sunday evening', () => {
    expect(weeklyRecapTime(WED)).toEqual(at(2026, 10, 18, 18));
  });
});

describe('weekly recap', () => {
  const point = (date: Date, domain: RatingPoint['domain'], rating: number, reason?: 'season'): RatingPoint => ({
    at: date.getTime(),
    domain,
    rating,
    rd: 60,
    ...(reason ? { reason } : {}),
  });

  it('counts sessions, games, active days and dailies within the week', () => {
    const r = weeklyRecap(
      {
        activity: {
          [localDayKey(at(2026, 10, 11))]: { sessions: 4, games: 12 }, // previous Sunday
          [localDayKey(at(2026, 10, 12))]: { sessions: 1, games: 3 },
          [localDayKey(at(2026, 10, 14))]: { sessions: 2, games: 5 },
        },
        history: [],
        daily: {
          '2026-10-14': { points: 900, accuracy: [1, 1, 1], completedAt: at(2026, 10, 14).getTime() },
          '2026-10-09': { points: 800, accuracy: [1, 1, 1], completedAt: at(2026, 10, 9).getTime() },
        },
      },
      weekRange(WED),
    );
    expect(r).toMatchObject({ sessions: 3, games: 8, activeDays: 2, dailies: 1 });
    expect(r.played).toEqual([true, false, true, false, false, false, false]);
  });

  it('adds up rating earned in play, ignoring season resets and earlier weeks', () => {
    const history = [
      point(at(2026, 10, 1), 'memory', 1500),
      point(at(2026, 10, 12), 'memory', 1520),
      point(at(2026, 10, 13), 'memory', 1480, 'season'),
      point(at(2026, 10, 15), 'memory', 1511.6),
      point(at(2026, 10, 14), 'logic', 1400), // first ever point: no baseline
      point(at(2026, 10, 16), 'logic', 1390),
      point(at(2026, 10, 20), 'speed', 1700), // next week
    ];
    const r = weeklyRecap({ activity: {}, history, daily: {} }, weekRange(WED));
    expect(r.gains).toEqual([
      { domain: 'memory', gain: 52 },
      { domain: 'logic', gain: -10 },
    ]);
    expect(r.best).toEqual({ domain: 'memory', gain: 52 });
  });

  it('is empty for a quiet week', () => {
    const r = weeklyRecap({ activity: {}, history: [], daily: {} }, weekRange(WED));
    expect(r).toMatchObject({ sessions: 0, activeDays: 0, gains: [], best: null });
  });
});

import { describe, expect, it } from 'vitest';
import { canCreateDuel, canStartRanked, rankedRemaining } from '../limits';
import { EMPTY_STREAK, MAX_SHIELDS, addDays, currentStreak, dayIndex, recordActivity, type StreakState } from '../streak';

const play = (state: StreakState, days: string[]) => days.reduce<StreakState>((s, d) => recordActivity(s, d), state);
const run = (start: string, n: number) => Array.from({ length: n }, (_, i) => addDays(start, i));

describe('streak', () => {
  it('counts consecutive days and is idempotent within a day', () => {
    const s = play(EMPTY_STREAK, ['2026-10-01', '2026-10-01', '2026-10-02', '2026-10-03']);
    expect(s.current).toBe(3);
    expect(s.best).toBe(3);
  });

  it('earns a shield every seven days, capped', () => {
    const s = play(EMPTY_STREAK, run('2026-01-01', 28));
    expect(s.current).toBe(28);
    expect(s.shields).toBe(MAX_SHIELDS);
  });

  it('spends a shield to cover one missed day', () => {
    const base = play(EMPTY_STREAK, run('2026-03-01', 7));
    expect(base.shields).toBe(1);
    const after = recordActivity(base, addDays('2026-03-07', 2));
    expect(after.current).toBe(8);
    expect(after.shields).toBe(0);
    expect(after.usedShields).toBe(1);
  });

  it('resets after more missed days than shields', () => {
    const base = play(EMPTY_STREAK, run('2026-03-01', 7));
    const after = recordActivity(base, addDays('2026-03-07', 4));
    expect(after.current).toBe(1);
    expect(after.best).toBe(7);
  });

  it('shows a lapsed streak as broken before the next play', () => {
    const base = play(EMPTY_STREAK, run('2026-05-01', 3));
    expect(currentStreak(base, '2026-05-04').current).toBe(3);
    expect(currentStreak(base, '2026-05-06').current).toBe(0);
  });

  it('ignores clocks moving backwards', () => {
    const base = play(EMPTY_STREAK, ['2026-06-10']);
    expect(recordActivity(base, '2026-06-01').current).toBe(1);
  });

  it('handles month and year boundaries in UTC', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(dayIndex('2027-03-01') - dayIndex('2027-02-28')).toBe(1);
  });
});

describe('limits', () => {
  it('gives free players one ranked session and one duel per day', () => {
    expect(canStartRanked(false, { rankedSessions: 0, duelsCreated: 0 })).toBe(true);
    expect(canStartRanked(false, { rankedSessions: 1, duelsCreated: 0 })).toBe(false);
    expect(canCreateDuel(false, { rankedSessions: 0, duelsCreated: 1 })).toBe(false);
    expect(rankedRemaining(false, { rankedSessions: 0, duelsCreated: 0 })).toBe(1);
  });

  it('lifts every limit for Pro', () => {
    expect(canStartRanked(true, { rankedSessions: 40, duelsCreated: 40 })).toBe(true);
    expect(canCreateDuel(true, { rankedSessions: 0, duelsCreated: 40 })).toBe(true);
    expect(rankedRemaining(true, { rankedSessions: 3, duelsCreated: 0 })).toBeNull();
  });
});

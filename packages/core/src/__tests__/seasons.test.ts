import { describe, expect, it } from 'vitest';
import { DOMAINS } from '../domains';
import { newRating } from '../glicko2';
import { initialRatings } from '../rating';
import {
  SEASON_PIVOT,
  SEASON_RD,
  bestSeasonDomain,
  recordSeasonSession,
  rollSeason,
  seasonBounds,
  seasonDaysLeft,
  seasonOf,
  softReset,
} from '../seasons';
import { PROVISIONAL_RD, tierInfo, type DomainRatings } from '../tiers';

const uniform = (rating: number, rd = 50): DomainRatings =>
  Object.fromEntries(DOMAINS.map((d) => [d, newRating(rating, rd)])) as DomainRatings;

describe('season calendar', () => {
  it('numbers calendar months in UTC from November 2026', () => {
    expect(seasonOf(new Date('2026-10-31T23:59:59Z'))).toBe(0);
    expect(seasonOf(new Date('2026-11-01T00:00:00Z'))).toBe(1);
    expect(seasonOf(new Date('2026-12-31T23:59:59Z'))).toBe(2);
    expect(seasonOf(new Date('2027-01-01T00:00:00Z'))).toBe(3);
    expect(seasonOf(new Date('2020-01-01T00:00:00Z'))).toBe(0);
  });

  it('gives each season its month as bounds', () => {
    expect(seasonBounds(1)).toEqual({ start: new Date('2026-11-01T00:00:00Z'), end: new Date('2026-12-01T00:00:00Z') });
    expect(seasonBounds(3).start).toEqual(new Date('2027-01-01T00:00:00Z'));
    expect(seasonBounds(0)).toEqual({ start: null, end: new Date('2026-11-01T00:00:00Z') });
  });

  it('counts the days left including today', () => {
    expect(seasonDaysLeft(new Date('2026-11-30T12:00:00Z'))).toBe(1);
    expect(seasonDaysLeft(new Date('2026-11-01T00:00:00Z'))).toBe(30);
  });
});

describe('soft reset', () => {
  it('eases ratings above the pivot back and leaves lower ratings alone', () => {
    const r = softReset({ ...uniform(1100), memory: newRating(2150, 50), focus: newRating(1750, 50) });
    expect(r.memory.rating).toBeCloseTo(2065);
    expect(r.focus.rating).toBeCloseTo(1705);
    expect(r.speed.rating).toBe(1100);
    expect(tierInfo(r.memory).tier).toBe('master');
  });

  it('widens deviations without making ratings provisional', () => {
    const r = softReset(uniform(1600, 46));
    for (const d of DOMAINS) {
      expect(r[d].rd).toBe(SEASON_RD);
      expect(r[d].rd).toBeLessThanOrEqual(PROVISIONAL_RD);
    }
    expect(softReset(uniform(1600, 200)).memory.rd).toBe(200);
  });

  it('is a no-op for players who have not placed yet', () => {
    expect(softReset(initialRatings())).toEqual(initialRatings());
  });

  it('applies once however many seasons were skipped', () => {
    const start = uniform(SEASON_PIVOT + 500);
    const rolled = rollSeason(start, 1, 5);
    expect(rolled).toMatchObject({ season: 5, reset: true });
    expect(rolled.ratings.memory.rating).toBeCloseTo(SEASON_PIVOT + 450);
    expect(rollSeason(rolled.ratings, 5, 5)).toEqual({ ratings: rolled.ratings, season: 5, reset: false });
  });
});

describe('season stats', () => {
  it('tracks sessions, games, peak and per-domain gains', () => {
    const a = uniform(1400);
    const b = { ...a, memory: newRating(1500, 50) };
    const c = { ...b, memory: newRating(1450, 50), logic: newRating(1420, 50) };
    let s = recordSeasonSession(null, 2, a, b, 3);
    s = recordSeasonSession(s, 2, b, c, 3);
    expect(s).toMatchObject({ season: 2, sessions: 2, games: 6, startRating: 1400 });
    // Six domains: one at 1500 lifts the mean to 1416.67; then 1450 + 1420 give 1411.67.
    expect(s.peakRating).toBeCloseTo(1416.67);
    expect(s.endRating).toBeCloseTo(1411.67);
    expect(s.gains).toEqual({ memory: 50, logic: 20 });
    expect(bestSeasonDomain(s)).toEqual({ domain: 'memory', gain: 50 });
  });

  it('starts over when the season changes', () => {
    const s1 = recordSeasonSession(null, 1, uniform(1400), uniform(1410), 3);
    const s2 = recordSeasonSession(s1, 2, uniform(1360), uniform(1370), 3);
    expect(s2).toMatchObject({ season: 2, sessions: 1, startRating: 1360 });
  });

  it('has no best domain when nothing went up', () => {
    expect(bestSeasonDomain({ gains: { memory: -10 } })).toBeNull();
  });
});

import { describe, expect, it } from 'vitest';
import { DOMAINS } from '../domains';
import { newRating } from '../glicko2';
import { leagueBand, leaguePoints, leagueWeek, leagueWeekEnd } from '../leagues';
import type { DomainRatings } from '../tiers';

const uniform = (rating: number): DomainRatings => Object.fromEntries(DOMAINS.map((d) => [d, newRating(rating, 60)])) as DomainRatings;

describe('league weeks', () => {
  it('start on Monday 00:00 UTC', () => {
    expect(leagueWeek(new Date('2026-10-19T00:00:00Z'))).toBe('2026-10-19');
    expect(leagueWeek(new Date('2026-10-21T13:00:00Z'))).toBe('2026-10-19');
    expect(leagueWeek(new Date('2026-10-25T23:59:59Z'))).toBe('2026-10-19');
    expect(leagueWeek(new Date('2026-10-26T00:00:00Z'))).toBe('2026-10-26');
  });

  it('cross months and years', () => {
    expect(leagueWeek(new Date('2027-01-01T12:00:00Z'))).toBe('2026-12-28');
    expect(leagueWeekEnd('2026-12-28').toISOString()).toBe('2027-01-04T00:00:00.000Z');
  });
});

describe('league bands', () => {
  it('follow the overall tier', () => {
    expect(leagueBand(uniform(800))).toBe(0);
    expect(leagueBand(uniform(1350))).toBe(3);
    expect(leagueBand(uniform(2200))).toBe(7);
  });
});

describe('league points', () => {
  const run = (...blocks: Array<[number, number]>) => ({ blocks: blocks.map(([itemRating, score]) => ({ itemRating, score })) });

  it('reward difficulty and accuracy together', () => {
    expect(leaguePoints([run([1500, 1], [1500, 1], [1500, 1])])).toBe(450);
    expect(leaguePoints([run([1500, 0.5])])).toBe(75);
    expect(leaguePoints([run([1800, 0.5])])).toBeGreaterThan(leaguePoints([run([1500, 0.5])]));
  });

  it('add up a whole session and never go negative', () => {
    expect(leaguePoints([run([1000, 1]), run([1000, 1]), run([1000, -0.4])])).toBe(200);
    expect(leaguePoints([])).toBe(0);
  });
});

import { describe, expect, it } from 'vitest';
import { DOMAINS } from '../domains';
import { newRating } from '../glicko2';
import { ladderStep, overallRating, tierChange, tierInfo, tierOf, type DomainRatings } from '../tiers';

const settled = (rating: number) => ({ rating, rd: 60 });

describe('tierOf', () => {
  it.each([
    [400, 'iron'],
    [899, 'iron'],
    [900, 'bronze'],
    [1299, 'silver'],
    [1300, 'gold'],
    [1500, 'platinum'],
    [1700, 'diamond'],
    [1900, 'master'],
    [2100, 'grandmaster'],
    [3000, 'grandmaster'],
  ])('%i → %s', (rating, tier) => {
    expect(tierOf(rating)).toBe(tier);
  });
});

describe('tierInfo', () => {
  it('assigns divisions IV→I across a tier', () => {
    expect(tierInfo(settled(1300)).label).toBe('Gold IV');
    expect(tierInfo(settled(1349)).label).toBe('Gold IV');
    expect(tierInfo(settled(1350)).label).toBe('Gold III');
    expect(tierInfo(settled(1400)).label).toBe('Gold II');
    expect(tierInfo(settled(1499)).label).toBe('Gold I');
  });

  it('reports progress and next threshold inside a division', () => {
    const info = tierInfo(settled(1425));
    expect(info.division).toBe(2);
    expect(info.progress).toBeCloseTo(0.5, 5);
    expect(info.nextThreshold).toBe(1450);
  });

  it('clamps very low ratings to Iron IV with zero progress', () => {
    const info = tierInfo(settled(300));
    expect(info.label).toBe('Iron IV');
    expect(info.progress).toBe(0);
  });

  it('has no divisions for Master and Grandmaster', () => {
    const master = tierInfo(settled(2000));
    expect(master.label).toBe('Master');
    expect(master.division).toBeNull();
    expect(master.progress).toBeCloseTo(0.5, 5);
    expect(master.nextThreshold).toBe(2100);
    const gm = tierInfo(settled(2400));
    expect(gm.label).toBe('Grandmaster');
    expect(gm.nextThreshold).toBeNull();
    expect(gm.progress).toBe(1);
  });

  it('marks high-RD ratings as provisional', () => {
    expect(tierInfo({ rating: 1500, rd: 300 }).provisional).toBe(true);
    expect(tierInfo({ rating: 1500, rd: 80 }).provisional).toBe(false);
  });
});

describe('tierChange', () => {
  it('detects division promotions and demotions', () => {
    expect(tierChange(settled(1340), settled(1360))).toBe('promoted');
    expect(tierChange(settled(1360), settled(1340))).toBe('demoted');
    expect(tierChange(settled(1360), settled(1370))).toBe('none');
  });

  it('detects tier boundaries separately', () => {
    expect(tierChange(settled(1495), settled(1505))).toBe('tier-up');
    expect(tierChange(settled(1505), settled(1495))).toBe('tier-down');
  });

  it('orders ladder steps monotonically with rating', () => {
    let last = -1;
    for (let r = 600; r <= 2500; r += 10) {
      const step = ladderStep(tierInfo(settled(r)));
      expect(step).toBeGreaterThanOrEqual(last);
      last = step;
    }
  });
});

describe('overallRating', () => {
  it('averages domain ratings', () => {
    const ratings = Object.fromEntries(
      DOMAINS.map((d, i) => [d, { rating: 1300 + i * 100, rd: 60, volatility: 0.06 }]),
    ) as DomainRatings;
    const o = overallRating(ratings);
    expect(o.rating).toBe(1500);
    expect(o.rd).toBeLessThan(60);
  });

  it('stays provisional while any domain is provisional', () => {
    const ratings = Object.fromEntries(DOMAINS.map((d) => [d, { rating: 1500, rd: 60, volatility: 0.06 }])) as DomainRatings;
    ratings.math = newRating(1500);
    expect(tierInfo(overallRating(ratings)).provisional).toBe(true);
  });
});

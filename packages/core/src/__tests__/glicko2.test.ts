import { describe, expect, it } from 'vitest';
import { conservativeRating, expectedScore, newRating, rate } from '../glicko2';

describe('Glicko-2', () => {
  it("matches Glickman's published worked example", () => {
    const player = { rating: 1500, rd: 200, volatility: 0.06 };
    const updated = rate(
      player,
      [
        { opponentRating: 1400, opponentRd: 30, score: 1 },
        { opponentRating: 1550, opponentRd: 100, score: 0 },
        { opponentRating: 1700, opponentRd: 300, score: 0 },
      ],
      { minRd: 0 },
    );
    expect(updated.rating).toBeCloseTo(1464.06, 1);
    expect(updated.rd).toBeCloseTo(151.52, 1);
    expect(updated.volatility).toBeCloseTo(0.05999, 4);
  });

  it('only inflates RD during an empty rating period', () => {
    const p = { rating: 1600, rd: 80, volatility: 0.06 };
    const next = rate(p, []);
    expect(next.rating).toBe(1600);
    expect(next.rd).toBeGreaterThan(80);
  });

  it('never lets RD exceed the ceiling or drop under the floor', () => {
    const fresh = newRating();
    const idle = rate(fresh, []);
    expect(idle.rd).toBeLessThanOrEqual(350);

    let p = newRating();
    for (let i = 0; i < 300; i++) p = rate(p, [{ opponentRating: p.rating, opponentRd: 50, score: 0.5 }]);
    expect(p.rd).toBeGreaterThanOrEqual(45);
  });

  it('rewards beating stronger opposition more than weaker', () => {
    const p = newRating(1500, 120);
    const vsStrong = rate(p, [{ opponentRating: 1800, opponentRd: 60, score: 1 }]);
    const vsWeak = rate(p, [{ opponentRating: 1200, opponentRd: 60, score: 1 }]);
    expect(vsStrong.rating - p.rating).toBeGreaterThan(vsWeak.rating - p.rating);
  });

  it('supports fractional scores', () => {
    const p = newRating(1500, 100);
    const half = rate(p, [{ opponentRating: 1500, opponentRd: 60, score: 0.5 }]);
    expect(Math.abs(half.rating - 1500)).toBeLessThan(0.01);
    const most = rate(p, [{ opponentRating: 1500, opponentRd: 60, score: 0.8 }]);
    expect(most.rating).toBeGreaterThan(1500);
  });

  it('rejects scores outside [0, 1]', () => {
    expect(() => rate(newRating(), [{ opponentRating: 1500, opponentRd: 60, score: 1.2 }])).toThrow(RangeError);
    expect(() => rate(newRating(), [{ opponentRating: 1500, opponentRd: 60, score: Number.NaN }])).toThrow(RangeError);
  });

  it('converges toward a stable skill level', () => {
    // A player who always scores 0.5 against 1700-rated items should approach 1700.
    let p = newRating();
    for (let i = 0; i < 200; i++) p = rate(p, [{ opponentRating: 1700, opponentRd: 50, score: 0.5 }]);
    expect(p.rating).toBeGreaterThan(1680);
    expect(p.rating).toBeLessThan(1720);
  });

  it('expectedScore is symmetric around equal ratings', () => {
    expect(expectedScore({ rating: 1500 }, { rating: 1500, rd: 50 })).toBeCloseTo(0.5, 10);
    expect(expectedScore({ rating: 1700 }, { rating: 1500, rd: 50 })).toBeGreaterThan(0.7);
  });

  it('conservativeRating subtracts two deviations', () => {
    expect(conservativeRating({ rating: 1600, rd: 50, volatility: 0.06 })).toBe(1500);
  });
});

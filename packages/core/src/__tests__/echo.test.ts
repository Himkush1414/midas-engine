import { describe, expect, it } from 'vitest';
import { echo, intervalFor, isTarget, nFor } from '../games/echo';
import { Rng } from '../random';
import { describeGameContract } from './contract';

describeGameContract(echo);

describe('echo', () => {
  it('raises n across level bands and speeds up within a band', () => {
    expect([1, 4, 8, 12].map(nFor)).toEqual([1, 2, 3, 4]);
    expect(intervalFor(3)).toBeLessThan(intervalFor(1));
    expect(intervalFor(4)).toBe(2200);
  });

  it('always contains at least two targets and two lures', () => {
    for (let level = 1; level <= 14; level++) {
      for (let s = 0; s < 30; s++) {
        const t = echo.generate(new Rng(`e${level}-${s}`), level);
        const scored = t.symbols.length - t.n;
        const targets = t.symbols.filter((_, i) => isTarget(t, i)).length;
        expect(targets).toBeGreaterThanOrEqual(2);
        expect(scored - targets).toBeGreaterThanOrEqual(2);
        for (const sym of t.symbols) expect(sym >= 0 && sym < t.symbolCount).toBe(true);
      }
    }
  });

  it('scores pressing nothing and pressing everything as chance', () => {
    const t = echo.generate(new Rng('chance'), 5);
    expect(echo.evaluate(t, t.symbols.map(() => false), 0).score).toBe(0);
    expect(echo.evaluate(t, t.symbols.map(() => true), 0).score).toBe(0);
  });

  it('rejects responses of the wrong length', () => {
    const t = echo.generate(new Rng('len'), 2);
    expect(echo.evaluate(t, [true], 0)).toEqual({ correct: false, score: 0 });
  });

  it('gives partial credit for one miss', () => {
    const t = { n: 1, symbols: [0, 0, 1, 1, 2, 3, 3, 4, 5, 0, 1], symbolCount: 6, intervalMs: 2000 };
    const perfect = echo.solve(t)!;
    const oneMiss = perfect.slice();
    const firstTarget = oneMiss.indexOf(true);
    oneMiss[firstTarget] = false;
    const outcome = echo.evaluate(t, oneMiss, 0);
    expect(outcome.score).toBeGreaterThan(0.5);
    expect(outcome.score).toBeLessThan(1);
  });
});

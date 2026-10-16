import { describe, expect, it } from 'vitest';
import { differenceFor, gridFor, spot } from '../games/spot';
import { Rng } from '../random';
import { describeGameContract } from './contract';

describeGameContract(spot);

describe('spot', () => {
  it('grows the grid and narrows the difference with level', () => {
    expect(gridFor(1)).toEqual({ cols: 3, rows: 3 });
    expect(gridFor(16)).toEqual({ cols: 6, rows: 7 });
    expect(differenceFor(1)).toBe(4);
    expect(differenceFor(16)).toBe(1);
  });

  it('places exactly one odd ring that differs by the level difference', () => {
    for (let level = 1; level <= 16; level++) {
      for (let s = 0; s < 40; s++) {
        const t = spot.generate(new Rng(`s${level}-${s}`), level);
        expect(t.odd).not.toBe(t.base);
        const d = Math.min((t.odd - t.base + 8) % 8, (t.base - t.odd + 8) % 8);
        expect(d).toBe(differenceFor(level));
        expect(t.oddIndex >= 0 && t.oddIndex < t.cols * t.rows).toBe(true);
      }
    }
  });

  it('marks the wrong tile as a miss', () => {
    const t = { cols: 3, rows: 3, base: 0, odd: 4, oddIndex: 5 };
    expect(spot.evaluate(t, 4, 800).correct).toBe(false);
    expect(spot.evaluate(t, 5, 800).correct).toBe(true);
  });

  it('rejects out-of-range indices', () => {
    expect(spot.isResponse(-1)).toBe(false);
    expect(spot.isResponse(1.5)).toBe(false);
    expect(spot.isResponse(3)).toBe(true);
  });
});

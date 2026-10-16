import { describe, expect, it } from 'vitest';
import { gridRecall, gridSizeFor, litCountFor } from '../games/grid-recall';
import { Rng } from '../random';
import { describeGameContract } from './contract';

describeGameContract(gridRecall);

describe('grid-recall', () => {
  it('grows grid and pattern with level', () => {
    expect(gridSizeFor(1)).toBe(3);
    expect(gridSizeFor(20)).toBe(6);
    expect(litCountFor(1)).toBe(3);
    expect(litCountFor(20)).toBeGreaterThan(litCountFor(10));
  });

  it('never lights every cell and keeps indices in range', () => {
    for (let level = 1; level <= 20; level++) {
      const t = gridRecall.generate(new Rng(`g${level}`), level);
      expect(t.cells.length).toBeLessThan(t.size * t.size);
      expect(new Set(t.cells).size).toBe(t.cells.length);
      for (const c of t.cells) expect(c >= 0 && c < t.size * t.size).toBe(true);
    }
  });

  it('gives partial credit and penalises wrong taps', () => {
    const trial = { size: 3, cells: [0, 4, 8], showMs: 1500 };
    expect(gridRecall.evaluate(trial, [0, 4], 0)).toEqual({ correct: false, score: 2 / 3 });
    expect(gridRecall.evaluate(trial, [0, 4, 7], 0)).toEqual({ correct: false, score: 1 / 3 });
    expect(gridRecall.evaluate(trial, [8, 0, 4], 0)).toEqual({ correct: true, score: 1 });
    expect(gridRecall.evaluate(trial, [1, 2, 3], 0).score).toBe(0);
  });

  it('counts duplicate taps once', () => {
    const trial = { size: 3, cells: [0, 4, 8], showMs: 1500 };
    expect(gridRecall.evaluate(trial, [0, 0, 0], 0).score).toBeCloseTo(1 / 3);
  });
});

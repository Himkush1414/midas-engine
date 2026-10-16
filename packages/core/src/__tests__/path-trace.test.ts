import { describe, expect, it } from 'vitest';
import { pathTrace, sequenceLengthFor } from '../games/path-trace';
import { Rng } from '../random';
import { describeGameContract } from './contract';

describeGameContract(pathTrace);

describe('path-trace', () => {
  it('lengthens sequences with level', () => {
    expect(sequenceLengthFor(1)).toBe(2);
    expect(sequenceLengthFor(18)).toBe(11);
  });

  it('only uses reverse rounds at high levels', () => {
    for (let level = 1; level < 13; level++) {
      for (let s = 0; s < 20; s++) expect(pathTrace.generate(new Rng(`r${level}-${s}`), level).reverse).toBe(false);
    }
    const highs = Array.from({ length: 50 }, (_, s) => pathTrace.generate(new Rng(`h${s}`), 16).reverse);
    expect(highs.some(Boolean)).toBe(true);
    expect(highs.every(Boolean)).toBe(false);
  });

  it('awards prefix credit and requires exact order', () => {
    const trial = { size: 3, sequence: [2, 5, 7, 1], stepMs: 600, reverse: false };
    expect(pathTrace.evaluate(trial, [2, 5, 1, 7], 0)).toEqual({ correct: false, score: 0.5 });
    expect(pathTrace.evaluate(trial, [2, 5, 7, 1], 0)).toEqual({ correct: true, score: 1 });
    expect(pathTrace.evaluate(trial, [2, 5, 7, 1, 3], 0).correct).toBe(false);
  });

  it('expects the reversed order on reverse rounds', () => {
    const trial = { size: 3, sequence: [2, 5, 7], stepMs: 600, reverse: true };
    expect(pathTrace.evaluate(trial, [7, 5, 2], 0).correct).toBe(true);
    expect(pathTrace.evaluate(trial, [2, 5, 7], 0).correct).toBe(false);
  });
});

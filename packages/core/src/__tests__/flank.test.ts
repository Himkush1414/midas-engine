import { describe, expect, it } from 'vitest';
import { flank, flankAnswer, flankersPerSide } from '../games/flank';
import { Rng } from '../random';
import { describeGameContract } from './contract';

describeGameContract(flank);

describe('flank', () => {
  it('adds flankers and shortens the window with level', () => {
    expect(flankersPerSide(1)).toBe(1);
    expect(flankersPerSide(16)).toBe(3);
    expect(flank.timeLimitMs(16)!).toBeLessThan(flank.timeLimitMs(1)!);
  });

  it('becomes more incongruent at higher levels', () => {
    const rate = (level: number) => {
      let inc = 0;
      for (let s = 0; s < 400; s++) {
        const t = flank.generate(new Rng(`f${level}-${s}`), level);
        if (t.left[0] !== t.center) inc++;
      }
      return inc / 400;
    };
    expect(rate(15)).toBeGreaterThan(rate(1) + 0.25);
  });

  it('reverses the answer for highlighted arrows', () => {
    const t = { center: 'left' as const, left: ['left' as const], right: ['left' as const], reverse: true };
    expect(flankAnswer(t)).toBe('right');
    expect(flank.evaluate(t, 'left', 500).correct).toBe(false);
    expect(flank.evaluate(t, 'right', 500).correct).toBe(true);
  });

  it('never reverses before level 9', () => {
    for (let s = 0; s < 200; s++) expect(flank.generate(new Rng(`nr${s}`), 8).reverse).toBe(false);
  });

  it('counts a timeout as a miss', () => {
    const t = flank.generate(new Rng('t'), 3);
    expect(flank.evaluate(t, null, 9999)).toEqual({ correct: false, score: 0 });
  });
});

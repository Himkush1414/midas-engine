import { describe, expect, it } from 'vitest';
import { balance, totalWeight } from '../games/balance';
import { Rng } from '../random';
import { describeGameContract } from './contract';

describeGameContract(balance);

describe('balance', () => {
  const each = (fn: (t: ReturnType<typeof balance.generate>, level: number) => void) => {
    for (let level = 1; level <= 14; level++) {
      for (let s = 0; s < 50; s++) fn(balance.generate(new Rng(`b${level}-${s}`), level), level);
    }
  };

  it('only shows scales that actually balance', () => {
    each((t) => {
      for (const eq of t.equations) expect(totalWeight(eq.left, t.weights)).toBe(totalWeight(eq.right, t.weights));
    });
  });

  it('has an integer answer that matches the hidden weights', () => {
    each((t) => {
      const answer = t.options[t.answerIndex]!;
      expect(Number.isInteger(answer)).toBe(true);
      expect(answer * t.weights[t.unit]!).toBe(totalWeight([t.ask], t.weights));
    });
  });

  it('offers four distinct positive options', () => {
    each((t) => {
      expect(new Set(t.options).size).toBe(4);
      for (const o of t.options) expect(o).toBeGreaterThan(0);
    });
  });

  it('adds more scales at higher levels', () => {
    expect(balance.generate(new Rng('x'), 1).equations).toHaveLength(1);
    expect(balance.generate(new Rng('x'), 6).equations).toHaveLength(2);
    expect(balance.generate(new Rng('x'), 14).equations).toHaveLength(3);
  });

  it('never asks about a shape in terms of itself', () => {
    each((t) => expect(t.ask.shape).not.toBe(t.unit));
  });
});

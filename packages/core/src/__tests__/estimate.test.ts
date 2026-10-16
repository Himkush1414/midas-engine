import { describe, expect, it } from 'vitest';
import { estimate, quantityValue, ratioFor } from '../games/estimate';
import { Rng } from '../random';
import { describeGameContract } from './contract';

describeGameContract(estimate);

describe('estimate', () => {
  const each = (fn: (t: ReturnType<typeof estimate.generate>, level: number) => void) => {
    for (let level = 1; level <= 16; level++) {
      for (let s = 0; s < 40; s++) fn(estimate.generate(new Rng(`e${level}-${s}`), level), level);
    }
  };

  it('marks the genuinely larger side and never ties', () => {
    each((t) => {
      const l = quantityValue(t.left);
      const r = quantityValue(t.right);
      expect(l).not.toBe(r);
      expect(t.answer).toBe(l > r ? 0 : 1);
    });
  });

  it('tightens the ratio with level', () => {
    expect(ratioFor(1)).toBeGreaterThan(ratioFor(5));
    expect(ratioFor(6)).toBeGreaterThan(ratioFor(10));
    expect(ratioFor(11)).toBeGreaterThan(ratioFor(16));
  });

  it('uses dots early, fractions mid, products and percentages late', () => {
    each((t, level) => {
      const kinds = [t.left.kind, t.right.kind];
      if (level <= 5) expect(kinds).toEqual(['dots', 'dots']);
      else if (level <= 10) expect(kinds).toEqual(['fraction', 'fraction']);
      else expect(kinds.every((k) => ['product', 'percent', 'number'].includes(k))).toBe(true);
    });
  });

  it('places dots inside the unit square without duplicates', () => {
    const t = estimate.generate(new Rng('dots'), 2);
    for (const q of [t.left, t.right]) {
      if (q.kind !== 'dots') throw new Error('expected dots');
      const keys = new Set(q.points.map(([x, y]) => `${x},${y}`));
      expect(keys.size).toBe(q.points.length);
      for (const [x, y] of q.points) expect(x > 0 && x < 1 && y > 0 && y < 1).toBe(true);
    }
  });

  it('balances which side is larger', () => {
    let left = 0;
    each((t) => {
      if (t.answer === 0) left++;
    });
    const share = left / (16 * 40);
    expect(share).toBeGreaterThan(0.42);
    expect(share).toBeLessThan(0.58);
  });
});

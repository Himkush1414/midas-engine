import { describe, expect, it } from 'vitest';
import { OPS, evaluateTokens, quickSum } from '../games/quick-sum';
import { Rng } from '../random';
import { describeGameContract } from './contract';

describeGameContract(quickSum);

describe('quick-sum', () => {
  it('answers match an independent evaluation of the displayed expression', () => {
    for (let level = 1; level <= 20; level++) {
      for (let s = 0; s < 80; s++) {
        const t = quickSum.generate(new Rng(`q${level}-${s}`), level);
        expect(evaluateTokens(t.tokens), t.tokens.join(' ')).toBe(t.answer);
      }
    }
  });

  it('keeps answers as non-negative integers', () => {
    for (let level = 1; level <= 20; level++) {
      for (let s = 0; s < 80; s++) {
        const { answer } = quickSum.generate(new Rng(`n${level}-${s}`), level);
        expect(Number.isInteger(answer)).toBe(true);
        expect(answer).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('introduces operators progressively', () => {
    const opsAt = (level: number) =>
      new Set(Array.from({ length: 100 }, (_, s) => quickSum.generate(new Rng(`o${level}-${s}`), level).tokens).flat());
    expect(opsAt(1).has(OPS.mul)).toBe(false);
    expect(opsAt(8).has(OPS.mul)).toBe(true);
    expect(opsAt(17).has(OPS.div) || opsAt(17).has('(')).toBe(true);
  });

  it('evaluateTokens respects precedence and parentheses', () => {
    expect(evaluateTokens(['2', OPS.add, '3', OPS.mul, '4'])).toBe(14);
    expect(evaluateTokens(['(', '2', OPS.add, '3', ')', OPS.mul, '4'])).toBe(20);
    expect(evaluateTokens(['20', OPS.div, '4', OPS.sub, '1'])).toBe(4);
  });

  it('rejects absurd numeric responses', () => {
    expect(quickSum.isResponse(-3)).toBe(false);
    expect(quickSum.isResponse(1e9)).toBe(false);
    expect(quickSum.isResponse(42)).toBe(true);
  });
});

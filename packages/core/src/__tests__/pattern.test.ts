import { describe, expect, it } from 'vitest';
import { PATTERN_RULES, pattern, ruleFor } from '../games/pattern';
import { Rng } from '../random';
import { describeGameContract } from './contract';

describeGameContract(pattern);

describe('pattern', () => {
  it('covers every rule family across the level range', () => {
    const seen = new Set(Array.from({ length: 18 }, (_, i) => ruleFor(i + 1)));
    expect(seen.size).toBe(PATTERN_RULES.length);
  });

  it('offers four unique non-negative integer options containing the answer', () => {
    for (let level = 1; level <= 18; level++) {
      for (let s = 0; s < 60; s++) {
        const t = pattern.generate(new Rng(`p${level}-${s}`), level);
        expect(t.sequence).toHaveLength(5);
        expect(t.options).toHaveLength(4);
        expect(new Set(t.options).size).toBe(4);
        for (const o of t.options) {
          expect(Number.isInteger(o)).toBe(true);
          expect(o).toBeGreaterThanOrEqual(0);
        }
        expect(t.answerIndex).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('produces the arithmetic continuation for the add rule', () => {
    const t = pattern.generate(new Rng('add'), 1);
    const step = t.sequence[1]! - t.sequence[0]!;
    for (let i = 1; i < 5; i++) expect(t.sequence[i]! - t.sequence[i - 1]!).toBe(step);
    expect(t.options[t.answerIndex]).toBe(t.sequence[4]! + step);
  });

  it('produces Fibonacci-style continuations', () => {
    const t = pattern.generate(new Rng('fib'), 11);
    expect(t.rule).toBe('fibonacci');
    expect(t.options[t.answerIndex]).toBe(t.sequence[4]! + t.sequence[3]!);
  });

  it('keeps every term non-negative', () => {
    for (let level = 1; level <= 18; level++) {
      for (let s = 0; s < 60; s++) {
        for (const v of pattern.generate(new Rng(`nn${level}-${s}`), level).sequence) expect(v).toBeGreaterThanOrEqual(0);
      }
    }
  });
});

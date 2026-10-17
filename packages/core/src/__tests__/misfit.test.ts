import { describe, expect, it } from 'vitest';
import { misfit, wordCountFor } from '../games/misfit';
import { categoryOf, groupOf } from '../games/words';
import { Rng } from '../random';
import { describeGameContract } from './contract';

describeGameContract(misfit);

describe('misfit', () => {
  it('has exactly one word outside the shared category, with no repeats', () => {
    for (let level = 1; level <= 14; level++) {
      for (let s = 0; s < 60; s++) {
        const t = misfit.generate(new Rng(`misfit-${level}-${s}`), level);
        expect(t.words).toHaveLength(wordCountFor(level));
        expect(new Set(t.words).size).toBe(t.words.length);
        const outsiders = t.words.map((w, i) => [i, categoryOf(w)] as const).filter(([, c]) => c !== t.category);
        expect(outsiders).toHaveLength(1);
        expect(outsiders[0]?.[0]).toBe(t.oddIndex);
      }
    }
  });

  it('shows more words and closer misfits as levels rise', () => {
    expect([wordCountFor(1), wordCountFor(7), wordCountFor(14)]).toEqual([4, 5, 6]);
    const close = (level: number) => {
      let n = 0;
      let total = 0;
      for (let s = 0; s < 300; s++) {
        const t = misfit.generate(new Rng(`close-${level}-${s}`), level);
        if (groupOf(t.category) === 'transport' || groupOf(t.category) === 'body') continue;
        total++;
        if (groupOf(categoryOf(t.words[t.oddIndex]!)) === groupOf(t.category)) n++;
      }
      return n / total;
    };
    expect(close(1)).toBe(0);
    expect(close(14)).toBeGreaterThan(0.75);
  });

  it('scores the tapped index', () => {
    const t = { category: 'fruit' as const, words: ['apple', 'pear', 'hammer', 'plum'] as ['apple', 'pear', 'hammer', 'plum'], oddIndex: 2 };
    expect(misfit.evaluate(t, 2, 900).correct).toBe(true);
    expect(misfit.evaluate(t, 0, 900).correct).toBe(false);
    expect(misfit.isResponse(7)).toBe(false);
  });
});

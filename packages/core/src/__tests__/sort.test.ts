import { describe, expect, it } from 'vitest';
import { closeLureShare, sort, sortAnswer } from '../games/sort';
import { categoryOf, groupOf } from '../games/words';
import { Rng } from '../random';
import { describeGameContract } from './contract';

describeGameContract(sort);

describe('sort', () => {
  const sample = (level: number, n = 400) => Array.from({ length: n }, (_, s) => sort.generate(new Rng(`sort-${level}-${s}`), level));

  it('asks about members and lures about half the time each', () => {
    const members = sample(7).filter(sortAnswer).length;
    expect(members).toBeGreaterThan(150);
    expect(members).toBeLessThan(250);
  });

  it('draws lures from unrelated groups early and from close relatives late', () => {
    const lures = (level: number) => sample(level).filter((t) => !sortAnswer(t));
    const closeShare = (level: number) => {
      const l = lures(level).filter((t) => groupOf(t.category) !== 'transport' && groupOf(t.category) !== 'body');
      return l.filter((t) => groupOf(categoryOf(t.word)) === groupOf(t.category)).length / l.length;
    };
    expect(closeShare(1)).toBe(0);
    expect(closeShare(14)).toBeGreaterThan(0.75);
    expect(closeLureShare(14)).toBeCloseTo(0.9);
  });

  it('accepts only the true answer, in time', () => {
    const t = { category: 'birds' as const, word: 'owl' as const };
    expect(sort.evaluate(t, true, 800).correct).toBe(true);
    expect(sort.evaluate(t, false, 800).correct).toBe(false);
    expect(sort.evaluate(t, null, 800).correct).toBe(false);
    expect(sortAnswer({ category: 'birds', word: 'trout' })).toBe(false);
    expect(sort.timeLimitMs(1)).toBeGreaterThan(sort.timeLimitMs(14) ?? 0);
  });
});

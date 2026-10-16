import { describe, expect, it } from 'vitest';
import { glyphSpec, match } from '../games/match';
import { Rng } from '../random';
import { describeGameContract } from './contract';

describeGameContract(match);

describe('match', () => {
  it('keeps the dot count equal and the glyphs consistent with `same`', () => {
    for (let level = 1; level <= 16; level++) {
      const { dots, moved } = glyphSpec(level);
      for (let s = 0; s < 40; s++) {
        const t = match.generate(new Rng(`m${level}-${s}`), level);
        expect(t.left).toHaveLength(dots);
        expect(t.right).toHaveLength(dots);
        expect(new Set(t.right).size).toBe(dots);
        const differing = t.right.filter((c) => !t.left.includes(c)).length;
        expect(differing).toBe(t.same ? 0 : moved);
      }
    }
  });

  it('fits the dots inside the glyph at every level', () => {
    for (let level = 1; level <= 16; level++) {
      const { size, dots, moved } = glyphSpec(level);
      expect(dots + moved).toBeLessThanOrEqual(size * size);
    }
  });

  it('makes differences subtler with level', () => {
    expect(glyphSpec(1).moved).toBeGreaterThan(glyphSpec(16).moved);
  });

  it('balances same and different trials', () => {
    const same = Array.from({ length: 600 }, (_, s) => match.generate(new Rng(`b${s}`), 7).same).filter(Boolean).length;
    expect(same / 600).toBeGreaterThan(0.42);
    expect(same / 600).toBeLessThan(0.58);
  });
});

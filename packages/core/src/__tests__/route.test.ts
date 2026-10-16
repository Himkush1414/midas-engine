import { describe, expect, it } from 'vitest';
import { follow, route, routeSpec } from '../games/route';
import { Rng } from '../random';
import { describeGameContract } from './contract';

describeGameContract(route);

describe('route', () => {
  it('scales grid and path length with level', () => {
    expect(routeSpec(1)).toEqual({ size: 4, steps: 3 });
    expect(routeSpec(16)).toEqual({ size: 7, steps: 14 });
  });

  it('lands exactly on the marked answer by following the arrows', () => {
    for (let level = 1; level <= 16; level++) {
      for (let s = 0; s < 40; s++) {
        const t = route.generate(new Rng(`r${level}-${s}`), level);
        expect(follow(t.size, t.arrows, t.start, t.steps)).toBe(t.options[t.answerIndex]);
      }
    }
  });

  it('offers four distinct in-grid options that exclude the start', () => {
    for (let level = 1; level <= 16; level++) {
      for (let s = 0; s < 40; s++) {
        const t = route.generate(new Rng(`o${level}-${s}`), level);
        expect(new Set(t.options).size).toBe(4);
        for (const o of t.options) {
          expect(o >= 0 && o < t.size * t.size).toBe(true);
          expect(o).not.toBe(t.start);
        }
        for (const a of t.arrows) expect(a >= 0 && a <= 3).toBe(true);
      }
    }
  });

  it('follow() reports leaving the grid', () => {
    // 2×2 grid, every arrow points up.
    expect(follow(2, [0, 0, 0, 0], 2, 1)).toBe(0);
    expect(follow(2, [0, 0, 0, 0], 2, 2)).toBeNull();
  });
});

import { describe, expect, it } from 'vitest';
import { Rng } from '../random';
import { clampLevel, fixedRamp, nextLevel, playableLevel, stepSizes, targetAccuracy } from '../staircase';

describe('staircase', () => {
  it('targets chance-corrected 50% accuracy', () => {
    expect(targetAccuracy(0)).toBe(0.5);
    expect(targetAccuracy(0.5)).toBe(0.75);
    expect(targetAccuracy(0.25)).toBe(0.625);
  });

  it('balances steps so the equilibrium matches the target', () => {
    for (const chance of [0, 0.25, 0.5]) {
      const { up, down } = stepSizes(chance);
      expect(down / (up + down)).toBeCloseTo(targetAccuracy(chance), 10);
    }
  });

  it('moves up on success and down on failure within bounds', () => {
    const cfg = { maxLevel: 10, chance: 0 };
    expect(nextLevel(5, true, 10, cfg)).toBeGreaterThan(5);
    expect(nextLevel(5, false, 10, cfg)).toBeLessThan(5);
    expect(nextLevel(10, true, 10, cfg)).toBe(10);
    expect(nextLevel(1, false, 10, cfg)).toBe(1);
  });

  it('takes bigger steps during the fast phase', () => {
    const cfg = { maxLevel: 20, chance: 0, fastTrials: 3, fastFactor: 2 };
    const fastStep = nextLevel(10, true, 0, cfg) - 10;
    const slowStep = nextLevel(10, true, 5, cfg) - 10;
    expect(fastStep).toBeCloseTo(slowStep * 2, 10);
  });

  it('converges near the level where a simulated player hits the target', () => {
    // Simulated yes/no player: true ability at level 12 of 20, logistic psychometric curve.
    const rng = new Rng('sim');
    const cfg = { maxLevel: 20, chance: 0.5 };
    const pCorrect = (level: number) => 0.5 + 0.5 / (1 + Math.exp((level - 12) / 1.2));
    let level = 3;
    const visited: number[] = [];
    for (let i = 0; i < 4000; i++) {
      const correct = rng.next() < pCorrect(playableLevel(level, cfg.maxLevel));
      level = nextLevel(level, correct, i, cfg);
      if (i > 200) visited.push(level);
    }
    const mean = visited.reduce((s, v) => s + v, 0) / visited.length;
    expect(mean).toBeGreaterThan(10.5);
    expect(mean).toBeLessThan(13.5);
  });

  it('clamps and rounds playable levels', () => {
    expect(clampLevel(0, 10)).toBe(1);
    expect(clampLevel(11, 10)).toBe(10);
    expect(playableLevel(4.6, 10)).toBe(5);
  });

  it('builds a monotonic fixed ramp within bounds', () => {
    const ramp = fixedRamp(12, 20);
    expect(ramp).toHaveLength(12);
    for (let i = 1; i < ramp.length; i++) expect(ramp[i]!).toBeGreaterThanOrEqual(ramp[i - 1]!);
    expect(Math.min(...ramp)).toBeGreaterThanOrEqual(1);
    expect(Math.max(...ramp)).toBeLessThanOrEqual(20);
    expect(fixedRamp(0, 20)).toEqual([]);
    expect(fixedRamp(1, 20)).toHaveLength(1);
  });
});

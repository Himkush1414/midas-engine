import type { GameDefinition } from './types';
import { binary, isInt, lerpByLevel } from './util';

/**
 * Visual search with Landolt-C rings: every ring has its gap pointing the
 * same way except one. Orientation is in 45° steps (0 = gap at the top, clockwise).
 */
export interface SpotTrial {
  cols: number;
  rows: number;
  /** Gap orientation of the common rings, 0..7. */
  base: number;
  /** Gap orientation of the odd ring, 0..7, never equal to `base`. */
  odd: number;
  oddIndex: number;
}

export type SpotResponse = number;

const MAX_LEVEL = 16;

export function gridFor(level: number): { cols: number; rows: number } {
  const cols = 3 + Math.floor((level - 1) / 4);
  return { cols, rows: cols + (level > 8 ? 1 : 0) };
}

/** Angular difference (in 45° steps) between odd and common rings. */
export function differenceFor(level: number): number {
  if (level <= 5) return 4;
  if (level <= 10) return 2;
  return 1;
}

export const spot: GameDefinition<SpotTrial, SpotResponse> = {
  id: 'spot',
  domain: 'focus',
  name: 'Spot',
  rules: 'Every ring has a gap. Find the one ring whose gap points a different way.',
  maxLevel: MAX_LEVEL,
  trialCount: 12,
  chance: 0,
  minHumanRtMs: 300,

  generate(rng, level) {
    const { cols, rows } = gridFor(level);
    const base = rng.int(0, 7);
    const diff = differenceFor(level);
    const odd = (base + (rng.chance(0.5) ? diff : 8 - diff)) % 8;
    return { cols, rows, base, odd, oddIndex: rng.int(0, cols * rows - 1) };
  },

  evaluate: (trial, response) => binary(response === trial.oddIndex),

  solve: (trial) => trial.oddIndex,

  timeLimitMs: (level) => Math.round(lerpByLevel(level, MAX_LEVEL, 6000, 2500)),

  isResponse: (value): value is SpotResponse => isInt(value) && value >= 0 && value < 100,
};

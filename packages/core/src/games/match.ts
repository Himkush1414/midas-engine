import type { GameDefinition } from './types';
import { binary, lerpByLevel } from './util';

/** Two dot-matrix glyphs; are they identical? */
export interface MatchTrial {
  /** Glyphs are size × size dot matrices. */
  size: number;
  /** Filled cell indices of each glyph, sorted. */
  left: number[];
  right: number[];
  same: boolean;
}

export type MatchResponse = boolean;

const MAX_LEVEL = 16;

export function glyphSpec(level: number): { size: number; dots: number; moved: number } {
  const size = level <= 8 ? 3 : 4;
  const dots = size === 3 ? 4 + Math.floor((level - 1) / 3) : 6 + Math.floor((level - 9) / 2);
  const moved = level <= 5 ? 3 : level <= 11 ? 2 : 1;
  return { size, dots, moved };
}

export const match: GameDefinition<MatchTrial, MatchResponse> = {
  id: 'match',
  domain: 'speed',
  name: 'Match',
  rules: 'Two dot patterns appear. Are they exactly the same? Decide as fast as you can.',
  maxLevel: MAX_LEVEL,
  trialCount: 20,
  chance: 0.5,
  minHumanRtMs: 220,

  generate(rng, level) {
    const { size, dots, moved } = glyphSpec(level);
    const cells = size * size;
    const left = rng.sample(0, cells - 1, dots).sort((a, b) => a - b);
    const same = rng.chance(0.5);
    if (same) return { size, left, right: left.slice(), same };
    // Move `moved` dots to empty cells, keeping the dot count identical.
    const filled = new Set(left);
    const empty = Array.from({ length: cells }, (_, i) => i).filter((i) => !filled.has(i));
    const removeIdx = rng.sample(0, left.length - 1, moved);
    const add = rng.sample(0, empty.length - 1, moved).map((i) => empty[i] as number);
    const right = left.filter((_, i) => !removeIdx.includes(i)).concat(add).sort((a, b) => a - b);
    return { size, left, right, same };
  },

  evaluate: (trial, response) => binary(response !== null && response === trial.same),

  solve: (trial) => trial.same,

  timeLimitMs: (level) => Math.round(lerpByLevel(level, MAX_LEVEL, 2800, 800)),

  isResponse: (value): value is MatchResponse => typeof value === 'boolean',
};

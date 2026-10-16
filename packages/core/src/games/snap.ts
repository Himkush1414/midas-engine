import type { GameDefinition } from './types';
import { binary, lerpByLevel } from './util';

/**
 * Go/no-go. The target is always shape 0 in colour 0 ("the teal circle").
 * Lures share more features with the target as levels rise.
 */
export interface SnapTrial {
  go: boolean;
  /** 0 = circle (target), 1 = square, 2 = triangle, 3 = diamond. */
  shape: number;
  /** 0 = target colour, 1 = near-target colour, 2 = contrasting colour. */
  color: number;
  /** Random wait before the stimulus appears, so taps can't be timed. */
  delayMs: number;
}

/** Did the player tap while the stimulus was shown? */
export type SnapResponse = boolean;

const MAX_LEVEL = 16;
const GO_RATE = 0.7;
/** Taps faster than this after onset are anticipations, not reactions. */
export const FALSE_START_MS = 100;

export function lureFor(level: number, pick: (n: number) => number): { shape: number; color: number } {
  if (level < 6) return { shape: 1 + pick(3), color: 2 };
  if (level <= 10) return pick(2) === 0 ? { shape: 0, color: 2 } : { shape: 1 + pick(3), color: 0 };
  // Hardest band: a single subtle difference.
  return pick(2) === 0 ? { shape: 0, color: 1 } : { shape: 3, color: 0 };
}

export const snap: GameDefinition<SnapTrial, SnapResponse> = {
  id: 'snap',
  domain: 'speed',
  name: 'Snap',
  rules: 'Tap as fast as you can when the teal circle appears. Hold back for anything else.',
  maxLevel: MAX_LEVEL,
  trialCount: 20,
  chance: 0.5,
  minHumanRtMs: 150,

  generate(rng, level) {
    const go = rng.chance(GO_RATE);
    const delayMs = rng.int(400, 1200);
    if (go) return { go, shape: 0, color: 0, delayMs };
    const lure = lureFor(level, (n) => rng.int(0, n - 1));
    return { go, ...lure, delayMs };
  },

  evaluate(trial, response, rtMs) {
    const tapped = response === true;
    if (trial.go) return binary(tapped && rtMs >= FALSE_START_MS);
    return binary(!tapped);
  },

  solve: (trial) => trial.go,

  timeLimitMs: (level) => Math.round(lerpByLevel(level, MAX_LEVEL, 1000, 380)),

  isResponse: (value): value is SnapResponse => typeof value === 'boolean',
};

/**
 * Weighted up/down staircase (Kaernbach, 1991).
 *
 * A level moves up by `up` after a correct answer and down by `down` after an
 * error, converging where p(correct) = down / (up + down). We target the level
 * where the *chance-corrected* accuracy is 50%, so guessing-prone yes/no games
 * do not drift to coin-flip difficulty.
 */

export interface StaircaseConfig {
  maxLevel: number;
  /** Probability of guessing correctly. */
  chance: number;
  /** Size of a downward step in levels. */
  down?: number;
  /** Multiplier applied to both steps for the first `fastTrials` trials. */
  fastFactor?: number;
  fastTrials?: number;
}

const DEFAULT_DOWN = 1.2;

export function targetAccuracy(chance: number): number {
  return chance + (1 - chance) * 0.5;
}

export function stepSizes(chance: number, down = DEFAULT_DOWN): { up: number; down: number } {
  const p = targetAccuracy(chance);
  return { up: (down * (1 - p)) / p, down };
}

export function clampLevel(level: number, maxLevel: number): number {
  return Math.min(maxLevel, Math.max(1, level));
}

/** The integer level actually used to generate a trial. */
export function playableLevel(level: number, maxLevel: number): number {
  return clampLevel(Math.round(level), maxLevel);
}

/** Next continuous level after a trial at `trialIndex` (0-based). */
export function nextLevel(level: number, correct: boolean, trialIndex: number, config: StaircaseConfig): number {
  const { up, down } = stepSizes(config.chance, config.down);
  const fast = trialIndex < (config.fastTrials ?? 0) ? (config.fastFactor ?? 1) : 1;
  const moved = correct ? level + up * fast : level - down * fast;
  return clampLevel(moved, config.maxLevel);
}

/** Fixed difficulty ramp shared by every player (Daily Challenge, duels). */
export function fixedRamp(trialCount: number, maxLevel: number, from = 0.15, to = 0.85): number[] {
  if (trialCount <= 0) return [];
  const start = 1 + (maxLevel - 1) * from;
  const end = 1 + (maxLevel - 1) * to;
  return Array.from({ length: trialCount }, (_, i) => {
    const t = trialCount === 1 ? 0 : i / (trialCount - 1);
    return playableLevel(start + (end - start) * t, maxLevel);
  });
}

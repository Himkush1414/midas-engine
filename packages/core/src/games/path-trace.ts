import type { GameDefinition } from './types';
import { isIntArray, lerpByLevel } from './util';

export interface PathTraceTrial {
  size: number;
  /** Tiles in the order they flash. */
  sequence: number[];
  /** Duration of each flash. */
  stepMs: number;
  /** When true the player must tap the sequence backwards. */
  reverse: boolean;
}

export type PathTraceResponse = number[];

const MAX_LEVEL = 18;
const REVERSE_FROM = 13;

export function sequenceLengthFor(level: number): number {
  return 2 + Math.floor(level / 2);
}

export const pathTrace: GameDefinition<PathTraceTrial, PathTraceResponse> = {
  id: 'path-trace',
  domain: 'memory',
  name: 'Path Trace',
  rules: 'Watch the tiles flash in order, then tap them in the same order. Reverse rounds ask for it backwards.',
  maxLevel: MAX_LEVEL,
  trialCount: 8,
  chance: 0,
  minHumanRtMs: 400,

  generate(rng, level) {
    const size = level < 6 ? 3 : 4;
    const length = Math.min(sequenceLengthFor(level), size * size);
    const sequence = rng.sample(0, size * size - 1, length);
    const stepMs = Math.round(lerpByLevel(level, MAX_LEVEL, 750, 480));
    const reverse = level >= REVERSE_FROM && rng.chance(0.5);
    return { size, sequence, stepMs, reverse };
  },

  evaluate(trial, response) {
    if (!response) return { correct: false, score: 0 };
    const expected = trial.reverse ? trial.sequence.slice().reverse() : trial.sequence;
    let prefix = 0;
    while (prefix < expected.length && response[prefix] === expected[prefix]) prefix++;
    const correct = prefix === expected.length && response.length === expected.length;
    return { correct, score: correct ? 1 : prefix / expected.length };
  },

  solve: (trial) => (trial.reverse ? trial.sequence.slice().reverse() : trial.sequence.slice()),

  timeLimitMs: (level) => Math.round(lerpByLevel(level, MAX_LEVEL, 12_000, 10_000)),

  isResponse: (value): value is PathTraceResponse => isIntArray(value, 32),
};

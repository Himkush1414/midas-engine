import type { GameDefinition } from './types';
import { binary, isOneOf, lerpByLevel } from './util';

export const FLANK_DIRECTIONS = ['left', 'right'] as const;
export type FlankDirection = (typeof FLANK_DIRECTIONS)[number];

export interface FlankTrial {
  center: FlankDirection;
  /** Flankers on each side, outermost first; the row is left + [center] + right. */
  left: FlankDirection[];
  right: FlankDirection[];
  /** Highlighted centre arrow: answer the opposite direction. */
  reverse: boolean;
}

export type FlankResponse = FlankDirection;

const MAX_LEVEL = 16;
const REVERSE_FROM = 9;

const opposite = (d: FlankDirection): FlankDirection => (d === 'left' ? 'right' : 'left');

export function flankersPerSide(level: number): number {
  if (level < 4) return 1;
  if (level < 9) return 2;
  return 3;
}

export function flankAnswer(trial: FlankTrial): FlankDirection {
  return trial.reverse ? opposite(trial.center) : trial.center;
}

export const flank: GameDefinition<FlankTrial, FlankResponse> = {
  id: 'flank',
  domain: 'focus',
  name: 'Flank',
  rules: 'Which way does the middle arrow point? Ignore its neighbours. If it glows amber, answer the opposite way.',
  maxLevel: MAX_LEVEL,
  trialCount: 20,
  chance: 0.5,
  minHumanRtMs: 180,

  generate(rng, level) {
    const center = rng.pick(FLANK_DIRECTIONS);
    const incongruent = rng.chance(lerpByLevel(level, MAX_LEVEL, 0.2, 0.7));
    const side = flankersPerSide(level);
    const flankerDir = incongruent ? opposite(center) : center;
    // At higher levels some flankers break formation to make the row harder to read as one unit.
    const scatter = level >= 12;
    const make = () =>
      Array.from({ length: side }, () => (scatter && rng.chance(0.25) ? opposite(flankerDir) : flankerDir));
    const reverse = level >= REVERSE_FROM && rng.chance(0.3);
    return { center, left: make(), right: make(), reverse };
  },

  evaluate: (trial, response) => binary(response === flankAnswer(trial)),

  solve: flankAnswer,

  timeLimitMs: (level) => Math.round(lerpByLevel(level, MAX_LEVEL, 2600, 725)),

  isResponse: isOneOf(FLANK_DIRECTIONS),
};

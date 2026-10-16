import type { GameDefinition } from './types';
import { binary, lerpByLevel } from './util';

/**
 * Attribute ids. The app renders them as colours (red, blue, yellow, green,
 * purple) or — in the colour-blind-friendly mode — as shapes (circle, square,
 * triangle, star, hexagon). The logic is identical either way.
 */
export const CLASH_ATTRIBUTES = 5;

export interface ClashTrial {
  /** What the top word says. */
  word: number;
  /** How the top word is drawn (its ink colour or its shape outline). */
  ink: number;
  /** What the bottom word says. */
  probe: number;
  /** Which property of the top word the question is about. */
  ask: 'ink' | 'meaning';
}

/** Does the bottom word describe the asked property? */
export type ClashResponse = boolean;

const MAX_LEVEL = 16;
const MEANING_FROM = 10;

export function clashAnswer(trial: ClashTrial): boolean {
  return trial.probe === (trial.ask === 'ink' ? trial.ink : trial.word);
}

export const clash: GameDefinition<ClashTrial, ClashResponse> = {
  id: 'clash',
  domain: 'focus',
  name: 'Clash',
  rules: 'Does the bottom word name how the top word is drawn? Read the cue — later rounds ask what it says instead.',
  maxLevel: MAX_LEVEL,
  trialCount: 18,
  chance: 0.5,
  minHumanRtMs: 250,

  generate(rng, level) {
    const pickOther = (avoid: number) => {
      let v = rng.int(0, CLASH_ATTRIBUTES - 1);
      while (v === avoid) v = rng.int(0, CLASH_ATTRIBUTES - 1);
      return v;
    };
    const ink = rng.int(0, CLASH_ATTRIBUTES - 1);
    const incongruent = rng.chance(lerpByLevel(level, MAX_LEVEL, 0.3, 0.85));
    const word = incongruent ? pickOther(ink) : ink;
    const ask: ClashTrial['ask'] = level >= MEANING_FROM && rng.chance(0.35) ? 'meaning' : 'ink';
    const target = ask === 'ink' ? ink : word;
    const distractor = ask === 'ink' ? word : ink;
    let probe: number;
    if (rng.chance(0.5)) probe = target;
    else if (distractor !== target && rng.chance(0.6)) probe = distractor; // the tempting wrong answer
    else probe = pickOther(target);
    return { word, ink, probe, ask };
  },

  evaluate: (trial, response) => binary(response !== null && response === clashAnswer(trial)),

  solve: clashAnswer,

  timeLimitMs: (level) => Math.round(lerpByLevel(level, MAX_LEVEL, 3000, 900)),

  isResponse: (value): value is ClashResponse => typeof value === 'boolean',
};

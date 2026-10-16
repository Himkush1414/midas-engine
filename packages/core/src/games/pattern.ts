import type { Rng } from '../random';
import type { GameDefinition } from './types';
import { binary, isInt, lerpByLevel, numericOptions } from './util';

export interface PatternTrial {
  /** Visible terms; the player picks the next one. */
  sequence: number[];
  options: number[];
  answerIndex: number;
  /** Rule family id, for analytics and the "explain" sheet. */
  rule: PatternRule;
}

/** Index into `options`. */
export type PatternResponse = number;

export const PATTERN_RULES = [
  'add',
  'subtract',
  'multiply',
  'alternate',
  'squares',
  'fibonacci',
  'growing-step',
  'interleave',
  'multiply-add',
] as const;
export type PatternRule = (typeof PATTERN_RULES)[number];

const MAX_LEVEL = 18;
const SHOWN = 5;

export function ruleFor(level: number): PatternRule {
  return PATTERN_RULES[Math.min(PATTERN_RULES.length - 1, Math.floor((level - 1) / 2))] as PatternRule;
}

/** Returns SHOWN + 1 terms; the last one is the answer. */
function buildTerms(rule: PatternRule, rng: Rng): number[] {
  const n = SHOWN + 1;
  const out: number[] = [];
  switch (rule) {
    case 'add': {
      const a = rng.int(1, 20);
      const k = rng.int(2, 9);
      for (let i = 0; i < n; i++) out.push(a + i * k);
      break;
    }
    case 'subtract': {
      const k = rng.int(3, 11);
      const a = k * n + rng.int(2, 30);
      for (let i = 0; i < n; i++) out.push(a - i * k);
      break;
    }
    case 'multiply': {
      const a = rng.int(1, 4);
      const k = rng.pick([2, 3]);
      for (let i = 0; i < n; i++) out.push(a * k ** i);
      break;
    }
    case 'alternate': {
      const p = rng.int(1, 6);
      let q = rng.int(2, 9);
      if (q === p) q += 3;
      out.push(rng.int(1, 15));
      for (let i = 1; i < n; i++) out.push((out[i - 1] as number) + (i % 2 === 1 ? p : q));
      break;
    }
    case 'squares': {
      const c = rng.int(1, 6);
      const shift = rng.int(0, 3);
      for (let i = 0; i < n; i++) out.push((i + c) ** 2 + shift);
      break;
    }
    case 'fibonacci': {
      out.push(rng.int(1, 5), rng.int(1, 6));
      for (let i = 2; i < n; i++) out.push((out[i - 1] as number) + (out[i - 2] as number));
      break;
    }
    case 'growing-step': {
      let step = rng.int(1, 4);
      const grow = rng.int(1, 3);
      out.push(rng.int(1, 12));
      for (let i = 1; i < n; i++) {
        out.push((out[i - 1] as number) + step);
        step += grow;
      }
      break;
    }
    case 'interleave': {
      const a = rng.int(1, 10);
      const b = rng.int(20, 40);
      const p = rng.int(2, 5);
      const q = -rng.int(1, 4);
      for (let i = 0; i < n; i++) out.push(i % 2 === 0 ? a + (i / 2) * p : b + ((i - 1) / 2) * q);
      break;
    }
    case 'multiply-add': {
      const c = rng.int(1, 4);
      out.push(rng.int(1, 5));
      for (let i = 1; i < n; i++) out.push(i % 2 === 1 ? (out[i - 1] as number) * 2 : (out[i - 1] as number) + c);
      break;
    }
  }
  return out;
}

export const pattern: GameDefinition<PatternTrial, PatternResponse> = {
  id: 'pattern',
  domain: 'logic',
  name: 'Pattern',
  rules: 'Work out the rule behind the numbers and pick what comes next.',
  maxLevel: MAX_LEVEL,
  trialCount: 8,
  chance: 0.25,
  minHumanRtMs: 900,

  generate(rng, level) {
    const rule = ruleFor(level);
    const terms = buildTerms(rule, rng);
    const answer = terms[SHOWN] as number;
    const sequence = terms.slice(0, SHOWN);
    const last = sequence[SHOWN - 1] as number;
    const prev = sequence[SHOWN - 2] as number;
    const lastDiff = last - prev;
    // Near misses: continuing the last difference, off-by-one-step, and the previous gap.
    const distractors = [last + lastDiff, answer + lastDiff, answer - (answer - last) / 2, answer + 1, answer - 2]
      .map((d) => Math.round(d))
      .filter((d) => d !== answer);
    const { options, answerIndex } = numericOptions(answer, rng.shuffle(distractors), (xs) => rng.shuffle(xs));
    return { sequence, options, answerIndex, rule };
  },

  evaluate: (trial, response) => binary(response === trial.answerIndex),

  solve: (trial) => trial.answerIndex,

  timeLimitMs: (level) => Math.round(lerpByLevel(level, MAX_LEVEL, 20_000, 9_000)),

  isResponse: (value): value is PatternResponse => isInt(value) && value >= 0 && value < 4,
};

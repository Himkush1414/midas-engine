import type { Rng } from '../random';
import type { GameDefinition } from './types';
import { binary, isInt, lerpByLevel } from './util';

export interface QuickSumTrial {
  /** Display tokens, e.g. ["(", "4", "+", "5", ")", "×", "3"]. */
  tokens: string[];
  answer: number;
}

export type QuickSumResponse = number;

const MAX_LEVEL = 20;
export const OPS = { add: '+', sub: '−', mul: '×', div: '÷' } as const;

type Built = { tokens: string[]; answer: number };

function build(rng: Rng, level: number): Built {
  const n = (min: number, max: number) => rng.int(min, max);
  if (level <= 3) {
    const a = n(1, level === 3 ? 15 : 9);
    const b = n(1, 9);
    return { tokens: [`${a}`, OPS.add, `${b}`], answer: a + b };
  }
  if (level <= 6) {
    const a = n(10, 40 + level * 8);
    const b = n(3, 30 + level * 4);
    if (level >= 5 && rng.chance(0.5)) {
      const [hi, lo] = a >= b ? [a, b] : [b, a];
      return { tokens: [`${hi}`, OPS.sub, `${lo}`], answer: hi - lo };
    }
    return { tokens: [`${a}`, OPS.add, `${b}`], answer: a + b };
  }
  if (level <= 9) {
    const a = n(2, level === 9 ? 12 : 9);
    const b = n(2, 9);
    return { tokens: [`${a}`, OPS.mul, `${b}`], answer: a * b };
  }
  if (level <= 12) {
    const a = n(10, 60);
    const b = n(5, 40);
    const c = n(2, Math.min(30, a + b));
    return { tokens: [`${a}`, OPS.add, `${b}`, OPS.sub, `${c}`], answer: a + b - c };
  }
  if (level <= 15) {
    if (rng.chance(0.5)) {
      const a = n(3, 9);
      const b = n(3, 9);
      const c = n(2, 30);
      return { tokens: [`${a}`, OPS.mul, `${b}`, OPS.add, `${c}`], answer: a * b + c };
    }
    const a = n(11, 40);
    const b = n(3, 9);
    return { tokens: [`${a}`, OPS.mul, `${b}`], answer: a * b };
  }
  if (level <= 18) {
    if (rng.chance(0.5)) {
      const a = n(2, 15);
      const b = n(2, 15);
      const c = n(2, 8);
      return { tokens: ['(', `${a}`, OPS.add, `${b}`, ')', OPS.mul, `${c}`], answer: (a + b) * c };
    }
    const b = n(3, 12);
    const q = n(3, 15);
    return { tokens: [`${b * q}`, OPS.div, `${b}`], answer: q };
  }
  // Precedence: a + b × c, or a × b − c × d (kept non-negative).
  if (rng.chance(0.5)) {
    const a = n(5, 50);
    const b = n(3, 12);
    const c = n(3, 9);
    return { tokens: [`${a}`, OPS.add, `${b}`, OPS.mul, `${c}`], answer: a + b * c };
  }
  const c = n(2, 6);
  const d = n(2, 6);
  const a = n(6, 12);
  const b = n(Math.ceil((c * d) / a) + 1, 12);
  return { tokens: [`${a}`, OPS.mul, `${b}`, OPS.sub, `${c}`, OPS.mul, `${d}`], answer: a * b - c * d };
}

/** Evaluates display tokens with standard precedence. Used to cross-check generated answers. */
export function evaluateTokens(tokens: readonly string[]): number {
  let pos = 0;
  const peek = () => tokens[pos];
  const factor = (): number => {
    const tok = tokens[pos++];
    if (tok === '(') {
      const v = expr();
      pos++; // ')'
      return v;
    }
    return Number(tok);
  };
  const term = (): number => {
    let v = factor();
    while (peek() === OPS.mul || peek() === OPS.div) {
      const op = tokens[pos++];
      const r = factor();
      v = op === OPS.mul ? v * r : v / r;
    }
    return v;
  };
  const expr = (): number => {
    let v = term();
    while (peek() === OPS.add || peek() === OPS.sub) {
      const op = tokens[pos++];
      const r = term();
      v = op === OPS.add ? v + r : v - r;
    }
    return v;
  };
  return expr();
}

export const quickSum: GameDefinition<QuickSumTrial, QuickSumResponse> = {
  id: 'quick-sum',
  domain: 'math',
  name: 'Quick Sum',
  rules: 'Solve each sum in your head and type the answer. Multiplication and division come first.',
  maxLevel: MAX_LEVEL,
  trialCount: 10,
  chance: 0,
  minHumanRtMs: 450,

  generate: (rng, level) => build(rng, level),

  evaluate: (trial, response) => binary(response === trial.answer),

  solve: (trial) => trial.answer,

  timeLimitMs: (level) => Math.round(lerpByLevel(level, MAX_LEVEL, 10_000, 7_500)),

  isResponse: (value): value is QuickSumResponse => isInt(value) && value >= 0 && value <= 99_999,
};

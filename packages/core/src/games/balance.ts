import type { GameDefinition } from './types';
import { binary, isInt, lerpByLevel, numericOptions } from './util';

/** Shape ids: 0 circle, 1 square, 2 triangle, 3 star. */
export interface BalanceTerm {
  shape: number;
  count: number;
}

/** A balanced scale: the total weight on both pans is equal. */
export interface BalanceEquation {
  left: BalanceTerm[];
  right: BalanceTerm[];
}

export interface BalanceTrial {
  equations: BalanceEquation[];
  /** "How many `unit` shapes balance `ask`?" */
  ask: BalanceTerm;
  unit: number;
  options: number[];
  answerIndex: number;
  /** Hidden weights per shape id, used for verification. */
  weights: number[];
}

export type BalanceResponse = number;

const MAX_LEVEL = 14;

const t = (shape: number, count: number): BalanceTerm => ({ shape, count });

export function totalWeight(terms: readonly BalanceTerm[], weights: readonly number[]): number {
  return terms.reduce((s, term) => s + (weights[term.shape] ?? 0) * term.count, 0);
}

export const balance: GameDefinition<BalanceTrial, BalanceResponse> = {
  id: 'balance',
  domain: 'logic',
  name: 'Balance',
  rules: 'Each scale is balanced. Use them to work out how many of one shape weigh the same as another.',
  maxLevel: MAX_LEVEL,
  trialCount: 6,
  chance: 0.25,
  minHumanRtMs: 1500,

  generate(rng, level) {
    // Map abstract roles A, B, C, D to random shapes so trials look different.
    const [A, B, C, D] = rng.shuffle([0, 1, 2, 3]) as [number, number, number, number];
    const weights = [0, 0, 0, 0];
    let equations: BalanceEquation[];
    let ask: BalanceTerm;
    let unit: number;
    let near: number[];

    if (level <= 4) {
      const k = rng.int(2, level <= 2 ? 5 : 6);
      const n = level <= 2 ? 1 : rng.int(2, 3);
      weights[B] = 1;
      weights[A] = k;
      equations = [{ left: [t(A, 1)], right: [t(B, k)] }];
      ask = t(A, n);
      unit = B;
      near = [k + n, k, n * k + 1];
    } else if (level <= 9) {
      const m = rng.int(2, 4);
      const k = rng.int(2, 3);
      weights[C] = 1;
      weights[B] = m;
      weights[A] = k * m;
      const double = level >= 7;
      equations = [
        { left: [t(A, 1)], right: [t(B, k)] },
        double ? { left: [t(B, 2)], right: [t(C, 2 * m)] } : { left: [t(B, 1)], right: [t(C, m)] },
      ];
      ask = t(A, double ? 2 : 1);
      unit = C;
      const ans = (double ? 2 : 1) * k * m;
      near = [k + m, ans + m, ans - k];
    } else if (level <= 11) {
      const m = rng.int(2, 4);
      const j = rng.int(1, 4);
      weights[C] = 1;
      weights[B] = m;
      weights[A] = m + j;
      equations = [
        { left: [t(A, 1)], right: [t(B, 1), t(C, j)] },
        { left: [t(B, 1)], right: [t(C, m)] },
      ];
      ask = t(A, 1);
      unit = C;
      near = [m * j, j + 1, m];
    } else {
      const c = rng.int(2, 3);
      const d = rng.int(1, 3);
      weights[D] = 1;
      weights[C] = c;
      weights[B] = c + d;
      weights[A] = 2 * (c + d);
      equations = [
        { left: [t(C, 1)], right: [t(D, c)] },
        { left: [t(B, 1)], right: [t(C, 1), t(D, d)] },
        { left: [t(A, 1)], right: [t(B, 2)] },
      ];
      ask = t(A, 1);
      unit = D;
      near = [c + d, 2 * c + d, 2 * (c + d) + 1];
    }

    const answer = totalWeight([ask], weights) / (weights[unit] as number);
    const { options, answerIndex } = numericOptions(
      answer,
      near.filter((v) => v !== answer && v > 0),
      (xs) => rng.shuffle(xs),
    );
    return { equations, ask, unit, options, answerIndex, weights };
  },

  evaluate: (trial, response) => binary(response === trial.answerIndex),

  solve: (trial) => trial.answerIndex,

  timeLimitMs: (level) => Math.round(lerpByLevel(level, MAX_LEVEL, 25_000, 12_000)),

  isResponse: (value): value is BalanceResponse => isInt(value) && value >= 0 && value < 4,
};

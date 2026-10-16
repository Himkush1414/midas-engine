import type { Rng } from '../random';
import type { GameDefinition } from './types';
import { binary, lerpByLevel } from './util';

export type Quantity =
  | { kind: 'dots'; points: Array<[number, number]> }
  | { kind: 'fraction'; num: number; den: number }
  | { kind: 'product'; a: number; b: number }
  | { kind: 'percent'; p: number; of: number }
  | { kind: 'number'; value: number };

export interface EstimateTrial {
  left: Quantity;
  right: Quantity;
  /** 0 if the left side is larger, 1 if the right side is. */
  answer: 0 | 1;
}

export type EstimateResponse = 0 | 1;

const MAX_LEVEL = 16;

export function quantityValue(q: Quantity): number {
  switch (q.kind) {
    case 'dots':
      return q.points.length;
    case 'fraction':
      return q.num / q.den;
    case 'product':
      return q.a * q.b;
    case 'percent':
      return (q.p * q.of) / 100;
    case 'number':
      return q.value;
  }
}

/** Target ratio between the larger and smaller side; shrinks with level. */
export function ratioFor(level: number): number {
  if (level <= 5) return lerpByLevel(level, 5, 2.0, 1.25);
  if (level <= 10) return 1.5 - ((level - 6) / 4) * 0.42;
  return 1.2 - ((level - 11) / 5) * 0.17;
}

function dotCloud(rng: Rng, count: number): Array<[number, number]> {
  // Jittered placement on a fine lattice so dots never overlap.
  const cells = rng.sample(0, 143, count);
  return cells.map((c) => {
    const x = (c % 12) / 12 + rng.next() * 0.05 + 0.02;
    const y = Math.floor(c / 12) / 12 + rng.next() * 0.05 + 0.02;
    return [Math.round(x * 1000) / 1000, Math.round(y * 1000) / 1000];
  });
}

function pair(rng: Rng, level: number): [Quantity, Quantity] {
  const ratio = ratioFor(level);
  if (level <= 5) {
    const small = rng.int(14, 40);
    const big = Math.min(70, Math.max(small + 1, Math.round(small * ratio)));
    return [
      { kind: 'dots', points: dotCloud(rng, small) },
      { kind: 'dots', points: dotCloud(rng, big) },
    ];
  }
  if (level <= 10) {
    // Search for two fractions whose values differ by roughly the target ratio.
    for (;;) {
      const d1 = rng.int(3, 12);
      const n1 = rng.int(1, d1 - 1);
      const d2 = rng.int(3, 12);
      const n2 = rng.int(1, d2 - 1);
      const v1 = n1 / d1;
      const v2 = n2 / d2;
      const r = Math.max(v1, v2) / Math.min(v1, v2);
      if (v1 !== v2 && r <= ratio + 0.15 && r >= 1.02) {
        const a: Quantity = { kind: 'fraction', num: n1, den: d1 };
        const b: Quantity = { kind: 'fraction', num: n2, den: d2 };
        return v1 < v2 ? [a, b] : [b, a];
      }
    }
  }
  for (;;) {
    if (rng.chance(0.5)) {
      const a = rng.int(6, 19);
      const b = rng.int(6, 19);
      const c = rng.int(6, 19);
      const d = rng.int(6, 19);
      const v1 = a * b;
      const v2 = c * d;
      const r = Math.max(v1, v2) / Math.min(v1, v2);
      if (v1 !== v2 && r <= ratio && r >= 1.01) {
        const x: Quantity = { kind: 'product', a, b };
        const y: Quantity = { kind: 'product', a: c, b: d };
        return v1 < v2 ? [x, y] : [y, x];
      }
    } else {
      const p = rng.pick([10, 15, 20, 25, 30, 40, 45, 60, 75, 80]);
      const of = rng.int(4, 40) * 10;
      const v = (p * of) / 100;
      const offset = Math.max(1, Math.round(v * (ratio - 1) * rng.next()));
      const value = rng.chance(0.5) ? v + offset : Math.max(1, v - offset);
      if (value !== v) {
        const x: Quantity = { kind: 'percent', p, of };
        const y: Quantity = { kind: 'number', value };
        return v < value ? [x, y] : [y, x];
      }
    }
  }
}

export const estimate: GameDefinition<EstimateTrial, EstimateResponse> = {
  id: 'estimate',
  domain: 'math',
  name: 'Estimate',
  rules: 'Two amounts appear. Tap the larger one — trust your gut, there is no time to count.',
  maxLevel: MAX_LEVEL,
  trialCount: 16,
  chance: 0.5,
  minHumanRtMs: 250,

  generate(rng, level) {
    const [small, big] = pair(rng, level);
    const bigOnLeft = rng.chance(0.5);
    return bigOnLeft ? { left: big, right: small, answer: 0 } : { left: small, right: big, answer: 1 };
  },

  evaluate: (trial, response) => binary(response === trial.answer),

  solve: (trial) => trial.answer,

  timeLimitMs: (level) => Math.round(lerpByLevel(level, MAX_LEVEL, 5000, 2400)),

  isResponse: (value): value is EstimateResponse => value === 0 || value === 1,
};

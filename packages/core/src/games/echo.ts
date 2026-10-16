import type { GameDefinition } from './types';
import { isBoolArray } from './util';

export interface EchoTrial {
  /** How many steps back a match refers to. */
  n: number;
  /** Symbol ids shown one at a time. */
  symbols: number[];
  /** Number of distinct symbols in play. */
  symbolCount: number;
  /** Time each symbol stays on screen, including the gap. */
  intervalMs: number;
}

/** One entry per symbol: did the player press "Match" while it was shown? */
export type EchoResponse = boolean[];

const MAX_LEVEL = 14;
const STREAM_EXTRA = 10;
const MATCH_RATE = 0.33;

export function nFor(level: number): number {
  if (level <= 3) return 1;
  if (level <= 7) return 2;
  if (level <= 11) return 3;
  return 4;
}

/** Within each n-band, later levels show symbols faster. */
export function intervalFor(level: number): number {
  const bandStart = [1, 4, 8, 12][nFor(level) - 1] ?? 1;
  return 2200 - (level - bandStart) * 250;
}

export function isTarget(trial: Pick<EchoTrial, 'n' | 'symbols'>, i: number): boolean {
  return i >= trial.n && trial.symbols[i] === trial.symbols[i - trial.n];
}

export const echo: GameDefinition<EchoTrial, EchoResponse> = {
  id: 'echo',
  domain: 'memory',
  name: 'Echo',
  rules: 'Symbols appear one by one. Tap Match when a symbol is the same as the one N steps back.',
  maxLevel: MAX_LEVEL,
  trialCount: 3,
  chance: 0,
  minHumanRtMs: 5000,

  generate(rng, level) {
    const n = nFor(level);
    const symbolCount = level >= 9 ? 8 : 6;
    const length = n + STREAM_EXTRA;
    for (;;) {
      const symbols: number[] = [];
      for (let i = 0; i < length; i++) {
        if (i >= n && rng.chance(MATCH_RATE)) {
          symbols.push(symbols[i - n] as number);
        } else {
          const avoid = i >= n ? symbols[i - n] : -1;
          let s = rng.int(0, symbolCount - 1);
          while (s === avoid) s = rng.int(0, symbolCount - 1);
          symbols.push(s);
        }
      }
      const trial = { n, symbols, symbolCount, intervalMs: intervalFor(level) };
      const targets = symbols.filter((_, i) => isTarget(trial, i)).length;
      // Keep blocks informative: at least two of each kind.
      if (targets >= 2 && length - n - targets >= 2) return trial;
    }
  },

  evaluate(trial, response) {
    if (!response || response.length !== trial.symbols.length) return { correct: false, score: 0 };
    let hits = 0;
    let targets = 0;
    let rejections = 0;
    let lures = 0;
    for (let i = trial.n; i < trial.symbols.length; i++) {
      if (isTarget(trial, i)) {
        targets++;
        if (response[i]) hits++;
      } else {
        lures++;
        if (!response[i]) rejections++;
      }
    }
    // Pressing during the first n symbols can never be right: count it as a false alarm.
    for (let i = 0; i < trial.n; i++) if (response[i]) lures++;
    const balanced = (hits / targets + rejections / lures) / 2;
    const score = Math.max(0, 2 * balanced - 1);
    return { correct: score >= 0.6, score };
  },

  solve: (trial) => trial.symbols.map((_, i) => isTarget(trial, i)),

  timeLimitMs: () => null,

  isResponse: (value): value is EchoResponse => isBoolArray(value, 64),
};

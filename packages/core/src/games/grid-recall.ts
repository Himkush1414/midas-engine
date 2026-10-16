import type { GameDefinition } from './types';
import { isIntArray, lerpByLevel } from './util';

export interface GridRecallTrial {
  /** Grid is size × size. */
  size: number;
  /** Indices of the lit cells, sorted ascending. */
  cells: number[];
  /** How long the pattern is shown before it hides. */
  showMs: number;
}

/** Cells the player tapped, in tap order. */
export type GridRecallResponse = number[];

const MAX_LEVEL = 20;

export function gridSizeFor(level: number): number {
  if (level <= 4) return 3;
  if (level <= 9) return 4;
  if (level <= 15) return 5;
  return 6;
}

export function litCountFor(level: number): number {
  return 3 + Math.floor((level - 1) * 0.55);
}

export const gridRecall: GameDefinition<GridRecallTrial, GridRecallResponse> = {
  id: 'grid-recall',
  domain: 'memory',
  name: 'Grid Recall',
  rules: 'Tiles light up for a moment. Tap every tile that was lit.',
  maxLevel: MAX_LEVEL,
  trialCount: 8,
  chance: 0,
  minHumanRtMs: 300,

  generate(rng, level) {
    const size = gridSizeFor(level);
    const count = Math.min(litCountFor(level), size * size - 1);
    const cells = rng.sample(0, size * size - 1, count).sort((a, b) => a - b);
    const showMs = Math.round(lerpByLevel(level, MAX_LEVEL, 1700, 1000));
    return { size, cells, showMs };
  },

  evaluate(trial, response) {
    if (!response) return { correct: false, score: 0 };
    const target = new Set(trial.cells);
    const tapped = new Set(response);
    let hits = 0;
    let falses = 0;
    for (const c of tapped) {
      if (target.has(c)) hits++;
      else falses++;
    }
    const score = Math.max(0, (hits - falses) / trial.cells.length);
    return { correct: hits === trial.cells.length && falses === 0, score };
  },

  solve: (trial) => trial.cells.slice(),

  // Recall window grows with the number of tiles to place, capped per level band.
  timeLimitMs: (level) => Math.round(lerpByLevel(level, MAX_LEVEL, 12_000, 9_000)),

  isResponse: (value): value is GridRecallResponse => isIntArray(value, 64),
};

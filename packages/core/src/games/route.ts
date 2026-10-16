import type { Rng } from '../random';
import type { GameDefinition } from './types';
import { binary, isInt, lerpByLevel } from './util';

/** Arrow directions: 0 up, 1 right, 2 down, 3 left. */
export interface RouteTrial {
  size: number;
  arrows: number[];
  start: number;
  /** Follow this many arrows from the start. */
  steps: number;
  /** Four candidate cells labelled A–D. */
  options: number[];
  answerIndex: number;
}

export type RouteResponse = number;

const MAX_LEVEL = 16;
const DX = [0, 1, 0, -1] as const;
const DY = [-1, 0, 1, 0] as const;

export function routeSpec(level: number): { size: number; steps: number } {
  return { size: 4 + Math.floor((level - 1) / 4), steps: 3 + Math.floor((level - 1) * 0.75) };
}

/** Cell reached by following arrows `steps` times, or null if it leaves the grid. */
export function follow(size: number, arrows: readonly number[], start: number, steps: number): number | null {
  let cell = start;
  for (let i = 0; i < steps; i++) {
    const d = arrows[cell] as number;
    const x = (cell % size) + (DX[d as 0] ?? 0);
    const y = Math.floor(cell / size) + (DY[d as 0] ?? 0);
    if (x < 0 || y < 0 || x >= size || y >= size) return null;
    cell = y * size + x;
  }
  return cell;
}

function selfAvoidingPath(rng: Rng, size: number, steps: number): number[] | null {
  const start = rng.int(0, size * size - 1);
  const path = [start];
  const seen = new Set(path);
  for (let i = 0; i < steps; i++) {
    const cur = path[path.length - 1] as number;
    const cx = cur % size;
    const cy = Math.floor(cur / size);
    const moves = rng.shuffle([0, 1, 2, 3]).filter((d) => {
      const x = cx + (DX[d as 0] ?? 0);
      const y = cy + (DY[d as 0] ?? 0);
      return x >= 0 && y >= 0 && x < size && y < size && !seen.has(y * size + x);
    });
    const d = moves[0];
    if (d === undefined) return null;
    const next = (cy + (DY[d as 0] ?? 0)) * size + cx + (DX[d as 0] ?? 0);
    path.push(next);
    seen.add(next);
  }
  return path;
}

export const route: GameDefinition<RouteTrial, RouteResponse> = {
  id: 'route',
  domain: 'logic',
  name: 'Route',
  rules: 'Start on the glowing tile and follow the arrows for the number of steps shown. Where do you end up?',
  maxLevel: MAX_LEVEL,
  trialCount: 8,
  chance: 0.25,
  minHumanRtMs: 1200,

  generate(rng, level) {
    const { size, steps } = routeSpec(level);
    let path: number[] | null = null;
    while (!path) path = selfAvoidingPath(rng, size, steps);
    const arrows = Array.from({ length: size * size }, () => rng.int(0, 3));
    for (let i = 0; i < path.length - 1; i++) {
      const a = path[i] as number;
      const b = path[i + 1] as number;
      const dx = (b % size) - (a % size);
      const dy = Math.floor(b / size) - Math.floor(a / size);
      arrows[a] = dy === -1 ? 0 : dx === 1 ? 1 : dy === 1 ? 2 : 3;
    }
    const start = path[0] as number;
    const answer = path[path.length - 1] as number;

    // Distractors: one step short, one step long, then the answer's neighbours, then anything.
    const candidates = [path[path.length - 2], follow(size, arrows, start, steps + 1), path[path.length - 3]];
    const ax = answer % size;
    const ay = Math.floor(answer / size);
    for (let d = 0; d < 4; d++) {
      const x = ax + (DX[d as 0] ?? 0);
      const y = ay + (DY[d as 0] ?? 0);
      if (x >= 0 && y >= 0 && x < size && y < size) candidates.push(y * size + x);
    }
    const picked = new Set<number>([answer]);
    for (const c of candidates) {
      if (picked.size >= 4) break;
      if (c !== null && c !== undefined && c !== start) picked.add(c);
    }
    while (picked.size < 4) {
      const c = rng.int(0, size * size - 1);
      if (c !== start) picked.add(c);
    }
    const options = rng.shuffle([...picked]);
    return { size, arrows, start, steps, options, answerIndex: options.indexOf(answer) };
  },

  evaluate: (trial, response) => binary(response === trial.answerIndex),

  solve: (trial) => trial.answerIndex,

  timeLimitMs: (level) => Math.round(lerpByLevel(level, MAX_LEVEL, 20_000, 10_000)),

  isResponse: (value): value is RouteResponse => isInt(value) && value >= 0 && value < 4,
};

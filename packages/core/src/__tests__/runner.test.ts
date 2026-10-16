import { describe, expect, it } from 'vitest';
import { newRating } from '../glicko2';
import {
  GameRun,
  ITEM_RATING_MAX,
  ITEM_RATING_MIN,
  buildTrial,
  correctForChance,
  levelToItemRating,
  ratingToLevel,
} from '../games/runner';
import type { GameDefinition } from '../games/types';
import { applyRun } from '../rating';

/** Toy game: answer the trial's number back. Difficulty does not matter. */
const echoNumber: GameDefinition<{ value: number }, number> = {
  id: 'quick-sum',
  domain: 'math',
  name: 'Test',
  rules: 'Repeat the number.',
  maxLevel: 20,
  trialCount: 12,
  chance: 0,
  generate: (rng, level) => ({ value: rng.int(0, 1000) + level * 10_000 }),
  evaluate: (trial, response) => {
    const correct = response === trial.value;
    return { correct, score: correct ? 1 : 0 };
  },
  solve: (trial) => trial.value,
  timeLimitMs: () => 5000,
  minHumanRtMs: 200,
  isResponse: (v): v is number => typeof v === 'number',
};

describe('level ↔ item rating', () => {
  it('spans the item rating range', () => {
    expect(levelToItemRating(1, 20)).toBe(ITEM_RATING_MIN);
    expect(levelToItemRating(20, 20)).toBe(ITEM_RATING_MAX);
  });

  it('round-trips', () => {
    for (const lvl of [1, 4.5, 10, 20]) expect(ratingToLevel(levelToItemRating(lvl, 20), 20)).toBeCloseTo(lvl, 10);
    expect(ratingToLevel(100, 20)).toBe(1);
    expect(ratingToLevel(5000, 20)).toBe(20);
  });
});

describe('correctForChance', () => {
  it('maps chance level to 0 and perfect to 1', () => {
    expect(correctForChance(0.5, 0.5)).toBe(0);
    expect(correctForChance(0.75, 0.5)).toBe(0.5);
    expect(correctForChance(1, 0.25)).toBe(1);
    expect(correctForChance(0.1, 0.25)).toBe(0);
  });
});

describe('GameRun', () => {
  it('climbs levels when answering correctly in ranked mode', () => {
    const run = new GameRun<{ value: number }, number>(echoNumber, { mode: 'ranked', seed: 's1', rating: 1300 });
    const start = run.currentLevel;
    while (!run.done) run.submit(run.currentTrial().value, 800);
    const summary = run.summary();
    expect(summary.accuracy).toBe(1);
    expect(summary.peakLevel).toBeGreaterThan(start);
    expect(summary.blocks).toHaveLength(3);
    expect(summary.points).toBe(0);
  });

  it('treats answers after the time limit as misses', () => {
    const run = new GameRun<{ value: number }, number>(echoNumber, { mode: 'ranked', seed: 's2' });
    const rec = run.submit(run.currentTrial().value, 6000);
    expect(rec.correct).toBe(false);
    expect(rec.response).toBeNull();
  });

  it('ignores time limits in zen mode', () => {
    const run = new GameRun<{ value: number }, number>(echoNumber, { mode: 'zen', seed: 's3' });
    expect(run.timeLimitMs).toBeNull();
    expect(run.submit(run.currentTrial().value, 60_000).correct).toBe(true);
  });

  it('serves identical content to every player in fixed modes', () => {
    const a = new GameRun<{ value: number }, number>(echoNumber, { mode: 'daily', seed: 'day' });
    const b = new GameRun<{ value: number }, number>(echoNumber, { mode: 'daily', seed: 'day' });
    const seqA: number[] = [];
    const seqB: number[] = [];
    while (!a.done) {
      seqA.push(a.currentTrial().value);
      a.submit(a.index % 2 === 0 ? a.currentTrial().value : -1, 900);
    }
    while (!b.done) {
      seqB.push(b.currentTrial().value);
      b.submit(b.currentTrial().value, 900);
    }
    // Different answers, same puzzles.
    expect(seqA).toEqual(seqB);
    expect(a.summary().points).toBeLessThan(b.summary().points);
    expect(b.summary().blocks).toHaveLength(0);
  });

  it('regenerates any trial deterministically for verification', () => {
    const run = new GameRun<{ value: number }, number>(echoNumber, { mode: 'ranked', seed: 'verify' });
    const first = run.currentTrial();
    expect(buildTrial<{ value: number }>(echoNumber, 'verify', 0, run.currentLevel)).toEqual(first);
  });

  it('throws when asked for a trial after completion', () => {
    const run = new GameRun(echoNumber, { mode: 'ranked', seed: 's4', trialCount: 1 });
    run.submit(null, 100);
    expect(run.done).toBe(true);
    expect(() => run.currentTrial()).toThrow();
  });
});

describe('applyRun', () => {
  it('raises the rating after a strong ranked game', () => {
    const run = new GameRun<{ value: number }, number>(echoNumber, { mode: 'ranked', seed: 'up', rating: 1300 });
    while (!run.done) run.submit(run.currentTrial().value, 700);
    const update = applyRun(newRating(1300, 200), run.summary());
    expect(update.delta).toBeGreaterThan(0);
  });

  it('lowers the rating after a weak ranked game', () => {
    const run = new GameRun<{ value: number }, number>(echoNumber, { mode: 'ranked', seed: 'down', rating: 1300 });
    while (!run.done) run.submit(-1, 700);
    expect(applyRun(newRating(1300, 200), run.summary()).delta).toBeLessThan(0);
  });

  it('does not change the rating in unrated modes', () => {
    const run = new GameRun<{ value: number }, number>(echoNumber, { mode: 'zen', seed: 'zen', rating: 1300 });
    while (!run.done) run.submit(run.currentTrial().value, 700);
    const current = newRating(1300, 200);
    expect(applyRun(current, run.summary())).toMatchObject({ delta: 0, after: current, change: 'none' });
  });
});

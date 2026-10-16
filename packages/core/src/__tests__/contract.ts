import { describe, expect, it } from 'vitest';
import { GameRun, buildTrial } from '../games/runner';
import type { AnyGameDefinition } from '../games/types';
import { Rng } from '../random';

/** Property tests every game must pass, at every level. */
export function describeGameContract(def: AnyGameDefinition, seeds = 25): void {
  describe(`${def.id} contract`, () => {
    const levels = Array.from({ length: def.maxLevel }, (_, i) => i + 1);

    it('declares sane metadata', () => {
      expect(def.maxLevel).toBeGreaterThanOrEqual(5);
      expect(def.trialCount).toBeGreaterThanOrEqual(3);
      expect(def.chance).toBeGreaterThanOrEqual(0);
      expect(def.chance).toBeLessThan(1);
      expect(def.minHumanRtMs).toBeGreaterThan(0);
      expect(def.rules.length).toBeGreaterThan(10);
    });

    it('generates deterministically at every level', () => {
      for (const level of levels) {
        const a = buildTrial(def, 'contract', level, level);
        const b = buildTrial(def, 'contract', level, level);
        expect(a).toEqual(b);
      }
    });

    it('generates JSON-serializable trials', () => {
      for (const level of levels) {
        const t = buildTrial(def, 'json', 0, level);
        expect(JSON.parse(JSON.stringify(t))).toEqual(t);
      }
    });

    it('scores the solver as fully correct at every level', () => {
      for (const level of levels) {
        for (let s = 0; s < seeds; s++) {
          const trial = def.generate(new Rng(`solve-${level}-${s}`), level);
          const answer = def.solve(trial);
          if (answer !== null) expect(def.isResponse(answer)).toBe(true);
          const outcome = def.evaluate(trial, answer, 1000);
          expect(outcome, `level ${level} seed ${s}`).toEqual({ correct: true, score: 1 });
        }
      }
    });

    it('keeps scores within [0, 1] for garbage-free nulls', () => {
      for (const level of levels) {
        const trial = def.generate(new Rng(`null-${level}`), level);
        const outcome = def.evaluate(trial, null, 1000);
        expect(outcome.score).toBeGreaterThanOrEqual(0);
        expect(outcome.score).toBeLessThanOrEqual(1);
      }
    });

    it('rejects malformed responses in isResponse', () => {
      for (const bad of [undefined, Symbol.for('x'), { evil: true }, 'DROP TABLE']) {
        expect(def.isResponse(bad)).toBe(false);
      }
    });

    it('has positive (or null) time limits that do not grow with level', () => {
      let last = Number.POSITIVE_INFINITY;
      for (const level of levels) {
        const limit = def.timeLimitMs(level);
        if (limit === null) continue;
        expect(limit).toBeGreaterThan(0);
        expect(limit).toBeLessThanOrEqual(last);
        last = limit;
      }
    });

    it('lets a perfect player climb in ranked mode', () => {
      const run = new GameRun(def, { mode: 'ranked', seed: 'climb', rating: 1000 });
      const start = run.currentLevel;
      while (!run.done) run.submit(def.solve(run.currentTrial()), def.minHumanRtMs + 50);
      const s = run.summary();
      expect(s.accuracy).toBe(1);
      expect(s.peakLevel).toBeGreaterThan(start);
    });
  });
}

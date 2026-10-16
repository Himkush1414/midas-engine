import { describe, expect, it } from 'vitest';
import { GameRun } from '../games/runner';
import { FALSE_START_MS, snap } from '../games/snap';
import { Rng } from '../random';
import { describeGameContract } from './contract';

describeGameContract(snap);

describe('snap', () => {
  const sample = (level: number, n = 500) =>
    Array.from({ length: n }, (_, s) => snap.generate(new Rng(`n${level}-${s}`), level));

  it('shows go targets about 70% of the time', () => {
    const go = sample(5).filter((t) => t.go).length / 500;
    expect(go).toBeGreaterThan(0.62);
    expect(go).toBeLessThan(0.78);
  });

  it('never makes a lure identical to the target', () => {
    for (let level = 1; level <= 16; level++) {
      for (const t of sample(level, 100)) if (!t.go) expect(t.shape === 0 && t.color === 0).toBe(false);
    }
  });

  it('makes lures more target-like at high levels', () => {
    const lures = sample(14).filter((t) => !t.go);
    expect(lures.every((t) => t.shape === 0 || t.color === 0)).toBe(true);
    const easy = sample(2).filter((t) => !t.go);
    expect(easy.every((t) => t.shape !== 0 && t.color === 2)).toBe(true);
  });

  it('punishes false starts and lure taps; rewards withholding', () => {
    const go = { go: true, shape: 0, color: 0, delayMs: 600 };
    const lure = { go: false, shape: 1, color: 2, delayMs: 600 };
    expect(snap.evaluate(go, true, FALSE_START_MS - 1).correct).toBe(false);
    expect(snap.evaluate(go, true, 320).correct).toBe(true);
    expect(snap.evaluate(go, null, 1000).correct).toBe(false);
    expect(snap.evaluate(lure, true, 320).correct).toBe(false);
    expect(snap.evaluate(lure, false, 1000).correct).toBe(true);
    expect(snap.evaluate(lure, null, 1000).correct).toBe(true);
  });

  it('treats a late tap on a go trial as a miss via the runner window', () => {
    const run = new GameRun<ReturnType<typeof snap.generate>, boolean>(snap, { mode: 'ranked', seed: 'late', rating: 1300 });
    let trial = run.currentTrial();
    while (!trial.go) {
      run.submit(false, run.timeLimitMs!);
      trial = run.currentTrial();
    }
    const rec = run.submit(true, run.timeLimitMs! + 1);
    expect(rec.correct).toBe(false);
  });
});

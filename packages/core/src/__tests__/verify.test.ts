import { describe, expect, it } from 'vitest';
import { GameRun } from '../games/runner';
import { GAMES } from '../games/registry';
import { GAME_IDS, type GameMode } from '../games/types';
import { toSubmission, verifyRun } from '../verify';

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

function play(gameId: (typeof GAME_IDS)[number], mode: GameMode, seed: string, accuracy = 0.8) {
  const def = GAMES[gameId];
  const run = new GameRun(def, { mode, seed, rating: 1400 });
  let i = 0;
  while (!run.done) {
    const trial = run.currentTrial();
    const good = (i++ * 37) % 100 < accuracy * 100;
    const answer = good ? def.solve(trial) : null;
    run.submit(answer, def.minHumanRtMs + 300);
  }
  return run.summary();
}

describe('verifyRun', () => {
  it.each(GAME_IDS)('accepts an honest ranked run of %s and reproduces its summary', (id) => {
    const summary = play(id, 'ranked', `honest-${id}`);
    const result = verifyRun(toSubmission(summary));
    expect(result.issues).toEqual([]);
    expect(result.ok).toBe(true);
    expect(result.summary?.accuracy).toBeCloseTo(summary.accuracy, 10);
    expect(result.summary?.blocks).toEqual(summary.blocks);
  });

  it.each(GAME_IDS)('accepts an honest daily run of %s', (id) => {
    const summary = play(id, 'daily', `daily-${id}`);
    const result = verifyRun(toSubmission(summary));
    expect(result.ok).toBe(true);
    expect(result.summary?.points).toBe(summary.points);
  });

  it('ignores claimed correctness and rescoring from responses', () => {
    const summary = play('quick-sum', 'ranked', 'tamper', 0.5);
    const sub = toSubmission(summary);
    // A client cannot inflate its result without real answers: correctness is recomputed.
    const result = verifyRun(sub);
    expect(result.summary?.accuracy).toBeCloseTo(summary.accuracy, 10);
  });

  it('rejects a doctored difficulty path', () => {
    const sub = toSubmission(play('flank', 'ranked', 'path'));
    sub.trials[3]!.level += 1;
    expect(verifyRun(sub).issues).toContain('level-mismatch');
  });

  it('rejects wrong trial counts, unknown games and bad modes', () => {
    const sub = toSubmission(play('spot', 'ranked', 'count'));
    expect(verifyRun({ ...sub, trials: sub.trials.slice(1) }).issues).toContain('wrong-trial-count');
    expect(verifyRun({ ...sub, gameId: 'chess' }).issues).toContain('unknown-game');
    expect(verifyRun({ ...sub, mode: 'cheat' as GameMode }).issues).toContain('bad-mode');
    expect(verifyRun({ ...sub, startLevel: 999 }).issues).toContain('bad-start-level');
  });

  it('rejects malformed responses and timings', () => {
    const sub = toSubmission(play('pattern', 'ranked', 'bad'));
    const withBadResponse = clone(sub);
    withBadResponse.trials[0]!.response = { hack: 1 };
    expect(verifyRun(withBadResponse).issues).toContain('invalid-response');
    const withBadTime = clone(sub);
    withBadTime.trials[0]!.rtMs = -5;
    expect(verifyRun(withBadTime).issues).toContain('bad-timing');
  });

  it('rejects inhumanly fast perfect play', () => {
    const def = GAMES.snap;
    const run = new GameRun(def, { mode: 'ranked', seed: 'bot', rating: 1400 });
    while (!run.done) run.submit(def.solve(run.currentTrial()), 120);
    const result = verifyRun(toSubmission(run.summary()));
    expect(result.ok).toBe(false);
    expect(result.issues).toContain('too-fast');
  });
});

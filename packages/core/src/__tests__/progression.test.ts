import { describe, expect, it } from 'vitest';
import { newRating, rate } from '../glicko2';
import { GAMES, getGame } from '../games/registry';
import { GameRun, ITEM_RD } from '../games/runner';
import { MAX_GAME_STEP, applyRun, applySession, initialRatings } from '../rating';
import { gameSeed, placementPlan, rankedPlan, type SessionPlan } from '../sessions';
import { overallRating, tierInfo, type DomainRatings } from '../tiers';

/** A bot that answers every trial correctly at a human-plausible pace, like the CI end-to-end player. */
function perfect(plan: SessionPlan, ratings: DomainRatings) {
  return plan.games.map((id, i) => {
    const def = GAMES[id];
    const run = new GameRun(def, { mode: plan.mode, seed: gameSeed(plan, i), rating: ratings[getGame(id).domain].rating });
    while (!run.done) run.submit(def.solve(run.currentTrial()), def.minHumanRtMs + 200);
    return run.summary();
  });
}

describe('early climb', () => {
  it.each(['a1', 'b2', 'c3'])('a perfect player (%s) cannot reach Grandmaster from placement plus one session', (seed) => {
    let r = applySession(initialRatings(), perfect(placementPlan(seed), initialRatings())).ratings;
    expect(tierInfo(overallRating(r)).tier).toBe('diamond');
    r = applySession(r, perfect(rankedPlan(seed, 0, r), r)).ratings;
    expect(tierInfo(overallRating(r)).tier).not.toBe('grandmaster');
  });

  it('still lets a perfect player keep climbing every session', () => {
    let r = applySession(initialRatings(), perfect(placementPlan('climb'), initialRatings())).ratings;
    const seen: number[] = [overallRating(r).rating];
    for (let s = 0; s < 8; s++) {
      r = applySession(r, perfect(rankedPlan('climb', s, r), r)).ratings;
      seen.push(overallRating(r).rating);
    }
    for (let i = 1; i < seen.length; i++) expect(seen[i]!).toBeGreaterThan(seen[i - 1]!);
    expect(tierInfo(overallRating(r)).tier).toBe('grandmaster');
  });

  it('limits each ranked game to the step and keeps the deviation while limited', () => {
    const before = newRating(1899, 270);
    const run = perfect(rankedPlan('step', 0, initialRatings()), initialRatings())[0]!;
    const update = applyRun(before, run);
    expect(update.after.rating).toBe(1899 + MAX_GAME_STEP);
    expect(update.after.rd).toBe(270);
  });

  it('leaves ordinary games to plain Glicko-2', () => {
    const settled = newRating(1500, 50);
    const run = perfect(rankedPlan('calm', 0, initialRatings()), initialRatings())[0]!;
    const plain = rate(settled, run.blocks.map((b) => ({ opponentRating: b.itemRating, opponentRd: ITEM_RD, score: b.score })));
    const update = applyRun(settled, run);
    expect(Math.abs(update.delta)).toBeLessThan(MAX_GAME_STEP);
    expect(update.after).toEqual(plain);
  });
});

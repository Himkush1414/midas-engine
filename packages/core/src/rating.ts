import { rate, type Rating } from './glicko2';
import { ITEM_RD, type RunSummary } from './games/runner';
import { RATED_MODES } from './games/types';
import { tierChange, type TierChange } from './tiers';

export interface RatingUpdate {
  before: Rating;
  after: Rating;
  delta: number;
  change: TierChange;
}

/** Apply one finished game to a domain rating. Unrated modes leave it untouched. */
export function applyRun(current: Rating, run: Pick<RunSummary, 'mode' | 'blocks'>): RatingUpdate {
  if (!RATED_MODES.includes(run.mode) || run.blocks.length === 0) {
    return { before: current, after: current, delta: 0, change: 'none' };
  }
  const after = rate(
    current,
    run.blocks.map((b) => ({ opponentRating: b.itemRating, opponentRd: ITEM_RD, score: b.score })),
  );
  return {
    before: current,
    after,
    delta: Math.round(after.rating) - Math.round(current.rating),
    change: tierChange(current, after),
  };
}

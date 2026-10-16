import { DOMAINS, type Domain } from './domains';
import { newRating, rate, type Rating } from './glicko2';
import { getGame, isGameId } from './games/registry';
import { ITEM_RD, type RunSummary } from './games/runner';
import { RATED_MODES, type GameId } from './games/types';
import { STARTING_RATING, TIER_FLOORS, tierChange, type DomainRatings, type TierChange } from './tiers';

/** Ratings are kept inside this band; items top out at 2400, so 2700 bounds runaway inflation. */
export const RATING_FLOOR = 400;
export const RATING_CEILING = 2700;
/** Placement can reach the top of Diamond at most: Master and Grandmaster are earned in ranked play. */
export const PLACEMENT_CAP = TIER_FLOORS.master - 1;

export function clampRating(r: Rating, max = RATING_CEILING): Rating {
  return { ...r, rating: Math.min(max, Math.max(RATING_FLOOR, r.rating)) };
}

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
  const rated = rate(
    current,
    run.blocks.map((b) => ({ opponentRating: b.itemRating, opponentRd: ITEM_RD, score: b.score })),
  );
  const after = clampRating(rated, run.mode === 'placement' ? Math.max(PLACEMENT_CAP, current.rating) : RATING_CEILING);
  return {
    before: current,
    after,
    delta: Math.round(after.rating) - Math.round(current.rating),
    change: tierChange(current, after),
  };
}

export interface SessionUpdate {
  ratings: DomainRatings;
  updates: Array<RatingUpdate & { domain: Domain; gameId: GameId }>;
}

/** Apply every game of a session in order; games in the same domain compound. */
export function applySession(ratings: DomainRatings, runs: ReadonlyArray<Pick<RunSummary, 'mode' | 'blocks' | 'gameId'>>): SessionUpdate {
  const next = { ...ratings };
  const updates: SessionUpdate['updates'] = [];
  for (const run of runs) {
    if (!isGameId(run.gameId)) continue;
    const domain = getGame(run.gameId).domain;
    const update = applyRun(next[domain], run);
    next[domain] = update.after;
    updates.push({ ...update, domain, gameId: run.gameId });
  }
  return { ratings: next, updates };
}

export function initialRatings(): DomainRatings {
  return Object.fromEntries(DOMAINS.map((d) => [d, newRating(STARTING_RATING)])) as DomainRatings;
}

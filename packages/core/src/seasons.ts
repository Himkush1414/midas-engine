import { DOMAINS, type Domain } from './domains';
import { overallRating, type DomainRatings } from './tiers';

/**
 * Seasons are calendar months in UTC. Season 1 is November 2026; anything
 * earlier is the preseason (season 0). At the start of each season every
 * player's ratings get one soft reset: high ratings ease back toward the
 * Gold floor and deviations widen, so the new season is a fresh climb
 * without throwing away what the ratings already know.
 */
export const SEASON_ONE = { year: 2026, month: 11 } as const;
/** Ratings at or below this are left alone by the reset. */
export const SEASON_PIVOT = 1300;
/** Share of the distance above the pivot that a reset takes away. */
export const SEASON_COMPRESSION = 0.1;
/** Deviation floor after a reset: ratings move faster early in a season, but are not provisional. */
export const SEASON_RD = 80;

const monthIndex = (year: number, month: number) => year * 12 + (month - 1);

/** Season number for a moment in time; 0 is the preseason. */
export function seasonOf(date: Date): number {
  const n = monthIndex(date.getUTCFullYear(), date.getUTCMonth() + 1) - monthIndex(SEASON_ONE.year, SEASON_ONE.month) + 1;
  return Math.max(0, n);
}

/** UTC start (inclusive) and end (exclusive) of a season. The preseason has no start. */
export function seasonBounds(season: number): { start: Date | null; end: Date } {
  const first = monthIndex(SEASON_ONE.year, SEASON_ONE.month);
  const at = (index: number) => new Date(Date.UTC(Math.floor(index / 12), index % 12, 1));
  if (season <= 0) return { start: null, end: at(first) };
  return { start: at(first + season - 1), end: at(first + season) };
}

/** Whole days left in the season containing `now`, counting today. */
export function seasonDaysLeft(now: Date): number {
  const { end } = seasonBounds(seasonOf(now));
  return Math.max(1, Math.ceil((end.getTime() - now.getTime()) / 86_400_000));
}

export function softReset(ratings: DomainRatings): DomainRatings {
  const next = { ...ratings };
  for (const d of DOMAINS) {
    const r = ratings[d];
    const rating = r.rating > SEASON_PIVOT ? r.rating - (r.rating - SEASON_PIVOT) * SEASON_COMPRESSION : r.rating;
    next[d] = { ...r, rating, rd: Math.max(r.rd, SEASON_RD) };
  }
  return next;
}

/**
 * Bring ratings recorded in `ratingsSeason` into `current`. However many
 * seasons were skipped, the reset is applied once.
 */
export function rollSeason(
  ratings: DomainRatings,
  ratingsSeason: number,
  current: number,
): { ratings: DomainRatings; season: number; reset: boolean } {
  if (ratingsSeason >= current) return { ratings, season: ratingsSeason, reset: false };
  return { ratings: softReset(ratings), season: current, reset: true };
}

/** What a player did in one season, for the recap. Ratings are overall (mean of domains). */
export interface SeasonStats {
  season: number;
  sessions: number;
  games: number;
  startRating: number;
  peakRating: number;
  endRating: number;
  /** Net rating change per domain this season. */
  gains: Partial<Record<Domain, number>>;
}

/** Fold one finished session into the season's stats. */
export function recordSeasonSession(
  stats: SeasonStats | null,
  season: number,
  before: DomainRatings,
  after: DomainRatings,
  games: number,
): SeasonStats {
  const base: SeasonStats =
    stats && stats.season === season
      ? stats
      : (() => {
          const start = overallRating(before).rating;
          return { season, sessions: 0, games: 0, startRating: start, peakRating: start, endRating: start, gains: {} };
        })();
  const end = overallRating(after).rating;
  const gains = { ...base.gains };
  for (const d of DOMAINS) {
    const delta = after[d].rating - before[d].rating;
    if (delta !== 0) gains[d] = (gains[d] ?? 0) + delta;
  }
  return {
    ...base,
    sessions: base.sessions + 1,
    games: base.games + games,
    peakRating: Math.max(base.peakRating, end),
    endRating: end,
    gains,
  };
}

/** The domain that gained the most this season, if any gained at all. */
export function bestSeasonDomain(stats: Pick<SeasonStats, 'gains'>): { domain: Domain; gain: number } | null {
  let best: { domain: Domain; gain: number } | null = null;
  for (const d of DOMAINS) {
    const gain = stats.gains[d] ?? 0;
    if (gain > 0 && (!best || gain > best.gain)) best = { domain: d, gain };
  }
  return best;
}

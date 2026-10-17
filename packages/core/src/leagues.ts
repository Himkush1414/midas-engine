import type { RunSummary } from './games/runner';
import { addDays } from './streak';
import { TIERS, overallRating, tierOf, type DomainRatings } from './tiers';

/**
 * Opt-in weekly leagues: groups of up to LEAGUE_SIZE players from the same
 * tier, competing over one UTC week (Monday to Sunday). Only each player's
 * first ranked session of a UTC day scores, so free and Pro players compete
 * on equal terms.
 */
export const LEAGUE_SIZE = 30;

/** UTC day key of the Monday that starts the league week containing `date`. */
export function leagueWeek(date: Date): string {
  const day = date.toISOString().slice(0, 10);
  const weekday = (date.getUTCDay() + 6) % 7; // Monday = 0
  return addDays(day, -weekday);
}

/** When a league week ends: the next Monday, 00:00 UTC. */
export function leagueWeekEnd(week: string): Date {
  return new Date(`${addDays(week, 7)}T00:00:00Z`);
}

/** Players are grouped with others of the same overall tier (0 = Iron … 7 = Grandmaster). */
export function leagueBand(ratings: DomainRatings): number {
  return TIERS.indexOf(tierOf(overallRating(ratings).rating));
}

/**
 * League points for a ranked session. Adaptive games have no fixed-puzzle
 * points, so each rated block scores its difficulty times how well it went:
 * harder puzzles solved well score more. Groups share a tier band, so
 * players face similar difficulties.
 */
export function leaguePoints(runs: ReadonlyArray<Pick<RunSummary, 'blocks'>>): number {
  let total = 0;
  for (const run of runs) for (const b of run.blocks) total += (Math.max(0, b.score) * b.itemRating) / 10;
  return Math.round(total);
}

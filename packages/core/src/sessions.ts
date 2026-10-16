import { DOMAINS, type Domain } from './domains';
import type { Rating } from './glicko2';
import { GAMES_BY_DOMAIN, PLACEMENT_GAMES } from './games/registry';
import type { GameId, GameMode } from './games/types';
import { Rng, seedFor } from './random';
import type { DomainRatings } from './tiers';

export const SESSION_LENGTH = 3;

export interface SessionPlan {
  mode: GameMode;
  /** Root seed for every game in this session. */
  seed: string;
  games: GameId[];
}

/** UTC calendar day, e.g. "2026-10-16". The Daily Challenge rolls over at 00:00 UTC. */
export function utcDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** At least this many games must stay enabled in each domain. */
export const MIN_ENABLED_PER_DOMAIN = 1;

/** Respects hidden games but never empties a domain. */
export function enabledGames(domain: Domain, hidden: ReadonlySet<GameId>): GameId[] {
  const all = GAMES_BY_DOMAIN[domain];
  const enabled = all.filter((g) => !hidden.has(g));
  return enabled.length >= MIN_ENABLED_PER_DOMAIN ? enabled : all;
}

export function placementPlan(userSeed: string): SessionPlan {
  return { mode: 'placement', seed: seedFor('placement', userSeed), games: DOMAINS.map((d) => PLACEMENT_GAMES[d]) };
}

/**
 * Ranked session: always includes the domain the player has played least
 * (highest RD), plus two others, never repeating a domain.
 */
export function rankedPlan(
  userSeed: string,
  sessionIndex: number,
  ratings: DomainRatings,
  hidden: ReadonlySet<GameId> = new Set(),
): SessionPlan {
  const seed = seedFor('ranked', userSeed, sessionIndex);
  const rng = new Rng(seed);
  const byUncertainty = DOMAINS.slice().sort((a, b) => ratings[b].rd - ratings[a].rd || a.localeCompare(b));
  const first = byUncertainty[0] as Domain;
  const others = rng.shuffle(DOMAINS.filter((d) => d !== first)).slice(0, SESSION_LENGTH - 1);
  const domains = rng.shuffle([first, ...others]);
  return { mode: 'ranked', seed, games: domains.map((d) => rng.pick(enabledGames(d, hidden))) };
}

/** Pro: three games from a single domain, varied where the domain allows it. */
export function focusPlan(userSeed: string, sessionIndex: number, domain: Domain, hidden: ReadonlySet<GameId> = new Set()): SessionPlan {
  const seed = seedFor('focus', userSeed, domain, sessionIndex);
  const rng = new Rng(seed);
  const pool = enabledGames(domain, hidden);
  const games: GameId[] = [];
  let bag: GameId[] = [];
  while (games.length < SESSION_LENGTH) {
    if (bag.length === 0) bag = rng.shuffle(pool);
    games.push(bag.pop() as GameId);
  }
  return { mode: 'ranked', seed, games };
}

/** Same three games for every player on a given UTC day, from three different domains. */
export function dailyPlan(dayKey: string): SessionPlan {
  const seed = seedFor('daily', dayKey);
  const rng = new Rng(seed);
  const domains = rng.shuffle(DOMAINS).slice(0, SESSION_LENGTH);
  return { mode: 'daily', seed, games: domains.map((d) => rng.pick(GAMES_BY_DOMAIN[d])) };
}

/** Both duelists play exactly this plan. */
export function duelPlan(duelId: string): SessionPlan {
  const seed = seedFor('duel', duelId);
  const rng = new Rng(seed);
  const domains = rng.shuffle(DOMAINS).slice(0, SESSION_LENGTH);
  return { mode: 'duel', seed, games: domains.map((d) => rng.pick(GAMES_BY_DOMAIN[d])) };
}

export function zenPlan(game: GameId, nonce: string): SessionPlan {
  return { mode: 'zen', seed: seedFor('zen', game, nonce), games: [game] };
}

/** Seed for an individual game within a session. */
export function gameSeed(plan: Pick<SessionPlan, 'seed'>, index: number): string {
  return seedFor(plan.seed, index);
}

export function ratingFor(ratings: DomainRatings, domain: Domain): Rating {
  return ratings[domain];
}

import { DOMAINS, type Domain } from './domains';
import { DEFAULT_GLICKO2_OPTIONS, type Rating } from './glicko2';

export const TIERS = ['iron', 'bronze', 'silver', 'gold', 'platinum', 'diamond', 'master', 'grandmaster'] as const;
export type TierId = (typeof TIERS)[number];

export const TIER_LABELS: Record<TierId, string> = {
  iron: 'Iron',
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
  platinum: 'Platinum',
  diamond: 'Diamond',
  master: 'Master',
  grandmaster: 'Grandmaster',
};

/** Lowest rating of each tier. Iron has no floor; its divisions start at 700. */
export const TIER_FLOORS: Record<TierId, number> = {
  iron: Number.NEGATIVE_INFINITY,
  bronze: 900,
  silver: 1100,
  gold: 1300,
  platinum: 1500,
  diamond: 1700,
  master: 1900,
  grandmaster: 2100,
};

const DIVISION_WIDTH = 50;
const IRON_BASE = 700;
const DIVISION_TIERS: readonly TierId[] = ['iron', 'bronze', 'silver', 'gold', 'platinum', 'diamond'];

/** Rating where new players start, before placement. */
export const STARTING_RATING = 1300;
/** Above this RD a rating is shown as provisional. */
export const PROVISIONAL_RD = 110;

export type Division = 1 | 2 | 3 | 4;
const ROMAN: Record<Division, string> = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV' };

export interface TierInfo {
  tier: TierId;
  /** 4 = lowest division, 1 = highest. Null for Master and Grandmaster. */
  division: Division | null;
  /** e.g. "Gold II" or "Master". */
  label: string;
  /** Progress through the current division (or tier, if undivided), 0..1. */
  progress: number;
  /** Rating needed for the next division/tier, null at the top. */
  nextThreshold: number | null;
  provisional: boolean;
}

export function tierOf(rating: number): TierId {
  let current: TierId = 'iron';
  for (const t of TIERS) if (rating >= TIER_FLOORS[t]) current = t;
  return current;
}

export function tierInfo(r: Pick<Rating, 'rating' | 'rd'>): TierInfo {
  const rating = Math.round(r.rating);
  const tier = tierOf(rating);
  const provisional = r.rd > PROVISIONAL_RD;
  const tierIndex = TIERS.indexOf(tier);
  const nextTier = TIERS[tierIndex + 1];

  if (DIVISION_TIERS.includes(tier)) {
    const floor = tier === 'iron' ? IRON_BASE : TIER_FLOORS[tier];
    const offset = Math.max(0, rating - floor);
    const step = Math.min(3, Math.floor(offset / DIVISION_WIDTH));
    const division = (4 - step) as Division;
    const divisionFloor = floor + step * DIVISION_WIDTH;
    const progress = rating < floor ? 0 : Math.min(1, (rating - divisionFloor) / DIVISION_WIDTH);
    return {
      tier,
      division,
      label: `${TIER_LABELS[tier]} ${ROMAN[division]}`,
      progress,
      nextThreshold: divisionFloor + DIVISION_WIDTH,
      provisional,
    };
  }

  const floor = TIER_FLOORS[tier];
  const ceiling = nextTier ? TIER_FLOORS[nextTier] : null;
  const progress = ceiling === null ? 1 : Math.min(1, (rating - floor) / (ceiling - floor));
  return { tier, division: null, label: TIER_LABELS[tier], progress, nextThreshold: ceiling, provisional };
}

/** Comparable ladder position: higher is better. Used to detect promotions/demotions. */
export function ladderStep(info: Pick<TierInfo, 'tier' | 'division'>): number {
  const base = TIERS.indexOf(info.tier) * 4;
  return base + (info.division === null ? 0 : 4 - info.division);
}

export type TierChange = 'promoted' | 'demoted' | 'tier-up' | 'tier-down' | 'none';

export function tierChange(before: Pick<Rating, 'rating' | 'rd'>, after: Pick<Rating, 'rating' | 'rd'>): TierChange {
  const a = tierInfo(before);
  const b = tierInfo(after);
  if (a.tier !== b.tier) return TIERS.indexOf(b.tier) > TIERS.indexOf(a.tier) ? 'tier-up' : 'tier-down';
  const sa = ladderStep(a);
  const sb = ladderStep(b);
  if (sb > sa) return 'promoted';
  if (sb < sa) return 'demoted';
  return 'none';
}

export type DomainRatings = Record<Domain, Rating>;

/** A domain counts once it has been played: unplayed ratings keep the maximum starting deviation. */
export function isPlayed(r: Pick<Rating, 'rd'>): boolean {
  return r.rd < DEFAULT_GLICKO2_OPTIONS.maxRd;
}

/**
 * Overall "Mind rating": the mean of the played domain ratings (of all of
 * them until any is played), so a newly added skill never drags a settled
 * rating down. The overall RD combines the domain deviations as the
 * standard error of that mean.
 */
export function overallRating(ratings: DomainRatings): Pick<Rating, 'rating' | 'rd'> {
  const all = DOMAINS.map((d) => ratings[d]);
  const played = all.filter(isPlayed);
  const values = played.length > 0 ? played : all;
  const rating = values.reduce((s, r) => s + r.rating, 0) / values.length;
  const rd = Math.sqrt(values.reduce((s, r) => s + r.rd * r.rd, 0)) / values.length;
  // Overall is provisional while any single domain still is.
  const anyProvisional = values.some((r) => r.rd > PROVISIONAL_RD);
  return { rating, rd: anyProvisional ? Math.max(rd, PROVISIONAL_RD + 1) : rd };
}

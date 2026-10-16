import { FREE_LIMITS, type Domain } from '@mindtier/core';
import type { RatingPoint } from '@/state/progress';
import type { SparkPoint } from '@/components/RatingSparkline';

/**
 * Rating history for one domain, starting from the provided starting rating,
 * limited to the free window unless the player has Pro.
 */
export function domainSeries(
  history: readonly RatingPoint[],
  domain: Domain,
  options: { isPro: boolean; now?: number; startRating?: number },
): { points: SparkPoint[]; truncated: boolean } {
  const now = options.now ?? Date.now();
  const cutoff = options.isPro ? Number.NEGATIVE_INFINITY : now - FREE_LIMITS.historyDays * 86_400_000;
  const all = history.filter((h) => h.domain === domain);
  const visible = all.filter((h) => h.at >= cutoff).map((h) => ({ at: h.at, value: h.rating }));
  const truncated = visible.length < all.length;
  if (visible.length === 0 && options.startRating !== undefined) return { points: [{ at: now, value: options.startRating }], truncated };
  return { points: visible, truncated };
}

/** Change across the visible window, rounded. */
export function windowDelta(points: readonly SparkPoint[]): number {
  const first = points[0];
  const last = points[points.length - 1];
  return first && last ? Math.round(last.value) - Math.round(first.value) : 0;
}

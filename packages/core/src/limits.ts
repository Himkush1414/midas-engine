/** Free-tier allowances. Pro removes every limit. Shared by the app and the API. */
export const FREE_LIMITS = {
  rankedSessionsPerDay: 1,
  duelsCreatedPerDay: 1,
  /** Days of rating history visible without Pro. */
  historyDays: 30,
} as const;

export interface UsageToday {
  rankedSessions: number;
  duelsCreated: number;
}

export function canStartRanked(isPro: boolean, usage: UsageToday): boolean {
  return isPro || usage.rankedSessions < FREE_LIMITS.rankedSessionsPerDay;
}

export function canCreateDuel(isPro: boolean, usage: UsageToday): boolean {
  return isPro || usage.duelsCreated < FREE_LIMITS.duelsCreatedPerDay;
}

export function rankedRemaining(isPro: boolean, usage: UsageToday): number | null {
  return isPro ? null : Math.max(0, FREE_LIMITS.rankedSessionsPerDay - usage.rankedSessions);
}

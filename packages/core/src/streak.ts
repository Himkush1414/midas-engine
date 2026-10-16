/**
 * Daily streaks with earned shields. A shield is earned at every 7-day
 * milestone (max 2 held) and automatically covers a single missed day.
 * Shields are never sold — the streak should motivate, not pressure.
 */

export interface StreakState {
  current: number;
  best: number;
  shields: number;
  /** UTC day key of the last day that counted, e.g. "2026-10-16". */
  lastDay: string | null;
}

export const MAX_SHIELDS = 2;
export const SHIELD_EVERY = 7;

export const EMPTY_STREAK: StreakState = { current: 0, best: 0, shields: 0, lastDay: null };

const DAY_MS = 86_400_000;

export function dayIndex(dayKey: string): number {
  return Math.round(Date.parse(`${dayKey}T00:00:00Z`) / DAY_MS);
}

export function addDays(dayKey: string, days: number): string {
  return new Date((dayIndex(dayKey) + days) * DAY_MS).toISOString().slice(0, 10);
}

/** Streak as it should be displayed today, accounting for days that lapsed. */
export function currentStreak(state: StreakState, today: string): StreakState {
  if (!state.lastDay) return state;
  const gap = dayIndex(today) - dayIndex(state.lastDay);
  if (gap <= 1) return state;
  const missed = gap - 1;
  if (missed <= state.shields) return state; // still protected until played
  return { ...state, current: 0, shields: 0 };
}

/** Record activity on `today`. Idempotent for repeated calls on the same day. */
export function recordActivity(state: StreakState, today: string): StreakState & { usedShields: number; earnedShield: boolean } {
  if (state.lastDay === today) return { ...state, usedShields: 0, earnedShield: false };
  let { current, shields } = state;
  let usedShields = 0;
  if (state.lastDay) {
    const gap = dayIndex(today) - dayIndex(state.lastDay);
    if (gap < 0) return { ...state, usedShields: 0, earnedShield: false }; // clock moved backwards
    const missed = gap - 1;
    if (missed === 0) current += 1;
    else if (missed <= shields) {
      shields -= missed;
      usedShields = missed;
      current += 1;
    } else {
      current = 1;
      shields = 0;
    }
  } else {
    current = 1;
  }
  const earnedShield = current > 0 && current % SHIELD_EVERY === 0 && shields < MAX_SHIELDS;
  if (earnedShield) shields += 1;
  return { current, best: Math.max(state.best, current), shields, lastDay: today, usedShields, earnedShield };
}

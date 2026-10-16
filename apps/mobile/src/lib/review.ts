import * as StoreReview from 'expo-store-review';
import { useProgress } from '@/state/progress';
import { syncStorage } from './storage';

const KEY = 'mindtier.review.lastAskedAt';
export const MIN_GAMES = 15;
export const COOLDOWN_DAYS = 60;

export function shouldAskForReview(gamesPlayed: number, lastAskedAt: number | null, now = Date.now()): boolean {
  if (gamesPlayed < MIN_GAMES) return false;
  return lastAskedAt === null || now - lastAskedAt > COOLDOWN_DAYS * 86_400_000;
}

/**
 * Ask for a store review at a high point (a promotion), rarely, and only after
 * real engagement. Uses the platform's native in-app review flow, which decides
 * itself whether to show anything. Never tied to rewards.
 */
export async function maybeAskForReview(): Promise<void> {
  try {
    const last = Number(syncStorage.getItem(KEY) ?? '') || null;
    if (!shouldAskForReview(useProgress.getState().gamesPlayed, last)) return;
    if (!(await StoreReview.isAvailableAsync())) return;
    syncStorage.setItem(KEY, String(Date.now()));
    await StoreReview.requestReview();
  } catch {
    // Reviews are a nice-to-have; never surface errors.
  }
}

import { dailyPlan, focusPlan, rankedPlan, utcDayKey, zenPlan, type Domain, type GameId, type SessionPlan } from '@mindtier/core';
import * as Crypto from 'expo-crypto';
import { router } from 'expo-router';
import { useProgress } from '@/state/progress';
import { useSession } from '@/state/session';
import { useSettings } from '@/state/settings';

function launch(plan: SessionPlan) {
  useSession.getState().start(plan);
  router.push('/session');
}

export function startRanked() {
  const p = useProgress.getState();
  const hidden = new Set(useSettings.getState().hiddenGames);
  launch(rankedPlan(p.userSeed, p.rankedSessionIndex, p.ratings, hidden));
}

export function startFocus(domain: Domain) {
  const p = useProgress.getState();
  const hidden = new Set(useSettings.getState().hiddenGames);
  launch(focusPlan(p.userSeed, p.rankedSessionIndex, domain, hidden));
}

export function startDaily(now = new Date()) {
  launch(dailyPlan(utcDayKey(now)));
}

export function startZen(game: GameId) {
  launch(zenPlan(game, Crypto.randomUUID()));
}

export function startPlan(plan: SessionPlan) {
  launch(plan);
}

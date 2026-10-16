import { canCreateDuel, duelPlan } from '@mindtier/core';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import { startPlan } from '@/features/session/start';
import { track } from '@/lib/analytics';
import { ApiError, api } from '@/lib/api';
import { links } from '@/lib/links';
import { shareText } from '@/lib/share';
import { useDuels } from '@/state/duels';
import { useEntitlements } from '@/state/entitlements';
import { useProgress } from '@/state/progress';

export function duelInviteText(id: string): string {
  return `I challenge you to a Mindtier duel — same three brain games, one winner. Code ${id.toUpperCase()}\n${links.duel(id)}`;
}

/** Create a duel on the server, then play your run right away. */
export async function createAndPlayDuel(): Promise<void> {
  const isPro = useEntitlements.getState().isPro;
  if (!canCreateDuel(isPro, useProgress.getState().usageToday())) {
    router.push({ pathname: '/paywall', params: { from: 'duel-limit' } });
    return;
  }
  try {
    const duel = await api.createDuel();
    useProgress.getState().noteDuelCreated();
    useDuels.getState().upsert({ id: duel.id, role: 'creator', expiresAt: duel.expiresAt });
    track('duel_created');
    startPlan(duelPlan(duel.id));
  } catch (e) {
    if (e instanceof ApiError && e.status === 402) {
      router.push({ pathname: '/paywall', params: { from: 'duel-limit' } });
      return;
    }
    Alert.alert('Couldn’t create a duel', 'Duels need an internet connection. Check it and try again.');
  }
}

export function playDuel(id: string): void {
  useDuels.getState().upsert({ id });
  track('duel_accepted');
  startPlan(duelPlan(id));
}

export function shareDuel(id: string): void {
  track('share_tapped', { what: 'duel' });
  void shareText(duelInviteText(id));
}

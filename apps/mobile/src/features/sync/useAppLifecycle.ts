import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import { setAnalyticsOptOut, track } from '@/lib/analytics';
import { initNotifications, notificationPath } from '@/lib/notifications';
import { initSounds } from '@/lib/sound';
import { startPurchases } from '@/lib/purchases';
import { currentUserId } from '@/lib/supabase';
import { usePrivacy } from '@/state/privacy';
import { useProgress } from '@/state/progress';
import { syncNow } from './sync';

const FOREGROUND_SYNC_MS = 30_000;

/** App-wide side effects: notifications, sync, purchases and analytics. */
export function useAppLifecycle(): void {
  const analyticsOptOut = usePrivacy((s) => s.analyticsOptOut);

  useEffect(() => {
    setAnalyticsOptOut(analyticsOptOut);
  }, [analyticsOptOut]);

  useEffect(() => {
    initNotifications();
    void initSounds();
    track('app_opened');
    let lastSync = 0;

    const sync = async () => {
      lastSync = Date.now();
      useProgress.getState().rollSeason();
      await syncNow();
      // RevenueCat's app user id is the Supabase user id so the webhook can map purchases to accounts.
      const uid = (await currentUserId()) ?? useProgress.getState().userSeed;
      await startPurchases(uid);
    };
    void sync();

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && Date.now() - lastSync > FOREGROUND_SYNC_MS) void sync();
    });

    // Tapped notifications open their deep link (cold start and while running).
    const open = (data: unknown) => {
      const path = notificationPath(data);
      if (path) router.push(path as never);
    };
    let tapSub: { remove(): void } | null = null;
    if (Platform.OS !== 'web') {
      void Notifications.getLastNotificationResponseAsync().then((r) => r && open(r.notification.request.content.data));
      tapSub = Notifications.addNotificationResponseReceivedListener((r) => open(r.notification.request.content.data));
    }
    return () => {
      sub.remove();
      tapSub?.remove();
    };
  }, []);
}

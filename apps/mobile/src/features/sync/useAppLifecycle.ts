import { useEffect } from 'react';
import { AppState } from 'react-native';
import { setAnalyticsOptOut, track } from '@/lib/analytics';
import { initNotifications } from '@/lib/notifications';
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
      await syncNow();
      // RevenueCat's app user id is the Supabase user id so the webhook can map purchases to accounts.
      const uid = (await currentUserId()) ?? useProgress.getState().userSeed;
      await startPurchases(uid);
    };
    void sync();

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && Date.now() - lastSync > FOREGROUND_SYNC_MS) void sync();
    });
    return () => sub.remove();
  }, []);
}

import { router } from 'expo-router';
import { LogBox, Platform } from 'react-native';
import { useAccount } from '@/state/account';
import { useDuels } from '@/state/duels';
import { useEntitlements } from '@/state/entitlements';
import { useProgress } from '@/state/progress';
import { useSession } from '@/state/session';
import { useSettings } from '@/state/settings';

/**
 * QA handle used by scripts/screenshots.mjs to put a web build into a given
 * state. Only present in development or in web exports built with
 * EXPO_PUBLIC_QA_HOOKS=1; store builds never set it and never run on web.
 */
const QA_BUILD = process.env.EXPO_PUBLIC_QA_HOOKS === '1';

export function installDevHooks(): void {
  if (!(__DEV__ || QA_BUILD) || Platform.OS !== 'web') return;
  // react-native-web forwards some native-only accessibility props to the DOM; harmless on web QA
  // builds, so keep the dev overlay from covering the UI in screenshots.
  LogBox.ignoreAllLogs(true);
  (globalThis as { __mindtier?: unknown }).__mindtier = {
    router,
    stores: { useAccount, useDuels, useEntitlements, useProgress, useSession, useSettings },
  };
}

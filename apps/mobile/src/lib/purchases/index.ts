import { Platform } from 'react-native';
import { useEntitlements } from '@/state/entitlements';
import { createFallbackProvider } from './fallback';
import { createRevenueCatProvider } from './revenuecat';
import type { EntitlementSnapshot, PurchasesProvider } from './types';

export * from './types';

const key = Platform.select({
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
});

export const purchases: PurchasesProvider = key ? createRevenueCatProvider(key) : createFallbackProvider(__DEV__);

export function applyEntitlement(e: EntitlementSnapshot): void {
  useEntitlements.getState().set({
    isPro: e.isPro,
    plan: e.plan,
    expiresAt: e.expiresAt,
    inTrial: e.inTrial,
    productId: e.productId,
    billingIssue: e.billingIssue,
  });
}

let started = false;

/** Configure the store once per launch and keep the cached entitlement fresh. */
export async function startPurchases(appUserId: string): Promise<void> {
  try {
    await purchases.configure(appUserId);
    if (!started) {
      started = true;
      purchases.onChange(applyEntitlement);
    }
    applyEntitlement(await purchases.refresh());
  } catch (e) {
    // Offline or store unavailable: keep the cached entitlement until the next launch.
    console.warn('purchases: refresh failed', e);
  }
}

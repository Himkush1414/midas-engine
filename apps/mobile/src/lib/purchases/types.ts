import type { PlanKind } from '@/state/entitlements';

export const ENTITLEMENT_ID = 'pro';

export const PRODUCT_IDS: Record<PlanKind, string> = {
  yearly: 'mindtier_pro_yearly',
  monthly: 'mindtier_pro_monthly',
  lifetime: 'mindtier_pro_lifetime',
};

export interface PlanOffer {
  /** Store package identifier passed back to purchase(). */
  id: string;
  kind: PlanKind;
  productId: string;
  /** Localised price, e.g. "$39.99" or "₹1,299.00". */
  priceString: string;
  /** Localised per-month equivalent for subscriptions. */
  pricePerMonthString: string | null;
  /** Length of the free trial in days, if the store offers one. */
  trialDays: number | null;
}

export interface EntitlementSnapshot {
  isPro: boolean;
  plan: PlanKind | null;
  expiresAt: string | null;
  inTrial: boolean;
  productId: string | null;
  billingIssue: boolean;
  managementUrl: string | null;
}

export type PurchaseOutcome =
  | { status: 'purchased'; entitlement: EntitlementSnapshot }
  | { status: 'cancelled' }
  | { status: 'pending'; message: string }
  | { status: 'failed'; message: string };

export interface PurchasesProvider {
  /** True when connected to a real store (Play Billing / App Store). */
  readonly live: boolean;
  configure(appUserId: string): Promise<void>;
  getPlans(): Promise<PlanOffer[]>;
  purchase(planId: string): Promise<PurchaseOutcome>;
  restore(): Promise<EntitlementSnapshot>;
  refresh(): Promise<EntitlementSnapshot>;
  /** Subscribe to entitlement changes pushed by the store. Returns an unsubscribe function. */
  onChange(listener: (e: EntitlementSnapshot) => void): () => void;
}

export const FREE_ENTITLEMENT: EntitlementSnapshot = {
  isPro: false,
  plan: null,
  expiresAt: null,
  inTrial: false,
  productId: null,
  billingIssue: false,
  managementUrl: null,
};

/** Parse an ISO-8601 period (P7D, P1W, P1M, P1Y) into days. Months count as 30, years as 365. */
export function periodToDays(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const m = /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)W)?(?:(\d+)D)?$/.exec(iso);
  if (!m) return null;
  const [, y, mo, w, d] = m;
  const days = Number(y ?? 0) * 365 + Number(mo ?? 0) * 30 + Number(w ?? 0) * 7 + Number(d ?? 0);
  return days > 0 ? days : null;
}

export function planKindFor(productId: string | null | undefined): PlanKind | null {
  if (!productId) return null;
  if (productId.includes('lifetime')) return 'lifetime';
  if (productId.includes('year') || productId.includes('annual')) return 'yearly';
  if (productId.includes('month')) return 'monthly';
  return null;
}

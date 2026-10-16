import { FREE_ENTITLEMENT, PRODUCT_IDS, type EntitlementSnapshot, type PlanOffer, type PurchasesProvider } from './types';

/** Reference US prices from docs/DECISION.md; real prices always come from the store. */
export const REFERENCE_PLANS: PlanOffer[] = [
  { id: '$rc_annual', kind: 'yearly', productId: PRODUCT_IDS.yearly, priceString: '$39.99', pricePerMonthString: '$3.33', trialDays: 7 },
  { id: '$rc_monthly', kind: 'monthly', productId: PRODUCT_IDS.monthly, priceString: '$7.99', pricePerMonthString: '$7.99', trialDays: null },
  { id: '$rc_lifetime', kind: 'lifetime', productId: PRODUCT_IDS.lifetime, priceString: '$79.99', pricePerMonthString: null, trialDays: null },
];

/**
 * Used when no store key is configured. In development builds it simulates
 * purchases so the full flow can be exercised; in release builds it never
 * grants Pro and reports that purchasing is unavailable.
 */
export function createFallbackProvider(simulate: boolean): PurchasesProvider {
  let state: EntitlementSnapshot = FREE_ENTITLEMENT;
  const listeners = new Set<(e: EntitlementSnapshot) => void>();
  const emit = () => listeners.forEach((l) => l(state));

  return {
    live: false,
    async configure() {},
    async getPlans() {
      return REFERENCE_PLANS;
    },
    async purchase(planId) {
      if (!simulate) return { status: 'failed', message: 'Purchases aren’t available in this build yet.' };
      const plan = REFERENCE_PLANS.find((p) => p.id === planId);
      if (!plan) return { status: 'failed', message: 'Unknown plan.' };
      const expires = plan.kind === 'lifetime' ? null : new Date(Date.now() + (plan.trialDays ?? 30) * 86_400_000).toISOString();
      state = {
        isPro: true,
        plan: plan.kind,
        expiresAt: expires,
        inTrial: plan.trialDays !== null,
        productId: plan.productId,
        billingIssue: false,
        managementUrl: null,
      };
      emit();
      return { status: 'purchased', entitlement: state };
    },
    async restore() {
      return state;
    },
    async refresh() {
      return state;
    },
    onChange(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

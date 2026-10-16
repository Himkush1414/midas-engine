import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { persistStorage } from '@/lib/storage';

export type PlanKind = 'yearly' | 'monthly' | 'lifetime';

export interface EntitlementState {
  isPro: boolean;
  plan: PlanKind | null;
  /** ISO date when the current period ends (null for lifetime or free). */
  expiresAt: string | null;
  /** Currently in a free trial period. */
  inTrial: boolean;
  /** Store product id, used to deep-link to the right subscription page. */
  productId: string | null;
  /** A billing problem (grace period / account hold) needs the user's attention. */
  billingIssue: boolean;
  set(next: Partial<Omit<EntitlementState, 'set' | 'reset'>>): void;
  reset(): void;
}

const free = { isPro: false, plan: null, expiresAt: null, inTrial: false, productId: null, billingIssue: false };

/** Cached entitlement; the purchases provider is the source of truth and refreshes it. */
export const useEntitlements = create<EntitlementState>()(
  persist(
    (set) => ({
      ...free,
      set: (next) => set(next),
      reset: () => set(free),
    }),
    { name: 'mindtier.entitlements.v1', storage: persistStorage, version: 1 },
  ),
);

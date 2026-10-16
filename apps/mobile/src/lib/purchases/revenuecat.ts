import Purchases, { LOG_LEVEL, PURCHASES_ERROR_CODE, type CustomerInfo, type PurchasesPackage } from 'react-native-purchases';
import {
  ENTITLEMENT_ID,
  FREE_ENTITLEMENT,
  periodToDays,
  planKindFor,
  type EntitlementSnapshot,
  type PlanOffer,
  type PurchasesProvider,
} from './types';

export function toSnapshot(info: CustomerInfo): EntitlementSnapshot {
  const ent = info.entitlements.active[ENTITLEMENT_ID];
  if (!ent) return { ...FREE_ENTITLEMENT, managementUrl: info.managementURL };
  return {
    isPro: true,
    plan: planKindFor(ent.productIdentifier),
    expiresAt: ent.expirationDate,
    inTrial: String(ent.periodType).toLowerCase() === 'trial',
    productId: ent.productIdentifier,
    billingIssue: ent.billingIssueDetectedAt !== null,
    managementUrl: info.managementURL,
  };
}

function toOffer(pkg: PurchasesPackage): PlanOffer | null {
  const kind = planKindFor(pkg.product.identifier) ?? (pkg.packageType === 'LIFETIME' ? 'lifetime' : pkg.packageType === 'ANNUAL' ? 'yearly' : pkg.packageType === 'MONTHLY' ? 'monthly' : null);
  if (!kind) return null;
  const freePhase = pkg.product.defaultOption?.freePhase ?? null;
  const intro = pkg.product.introPrice;
  const trialDays =
    periodToDays(freePhase?.billingPeriod?.iso8601) ?? (intro && intro.price === 0 ? periodToDays(intro.period) : null);
  return {
    id: pkg.identifier,
    kind,
    productId: pkg.product.identifier,
    priceString: pkg.product.priceString,
    pricePerMonthString: kind === 'lifetime' ? null : pkg.product.pricePerMonthString,
    trialDays,
  };
}

export function createRevenueCatProvider(apiKey: string): PurchasesProvider {
  let packages = new Map<string, PurchasesPackage>();
  let configured = false;

  return {
    live: true,

    async configure(appUserId) {
      if (!configured) {
        if (__DEV__) void Purchases.setLogLevel(LOG_LEVEL.WARN);
        Purchases.configure({ apiKey, appUserID: appUserId });
        configured = true;
      } else {
        await Purchases.logIn(appUserId);
      }
    },

    async getPlans() {
      const offerings = await Purchases.getOfferings();
      const current = offerings.current;
      if (!current) return [];
      packages = new Map(current.availablePackages.map((p) => [p.identifier, p]));
      return current.availablePackages.map(toOffer).filter((o): o is PlanOffer => o !== null);
    },

    async purchase(planId) {
      const pkg = packages.get(planId);
      if (!pkg) return { status: 'failed', message: 'That plan is not available right now.' };
      try {
        const result = await Purchases.purchasePackage(pkg);
        const entitlement = toSnapshot(result.customerInfo);
        return entitlement.isPro
          ? { status: 'purchased', entitlement }
          : { status: 'pending', message: 'Your purchase is processing. Pro unlocks as soon as Google Play confirms it.' };
      } catch (e) {
        const err = e as { code?: string; userCancelled?: boolean; message?: string };
        if (err.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR || err.userCancelled) return { status: 'cancelled' };
        if (err.code === PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR) {
          return { status: 'pending', message: 'Payment is pending. Pro unlocks automatically once it completes.' };
        }
        return { status: 'failed', message: err.message ?? 'The purchase could not be completed.' };
      }
    },

    async restore() {
      return toSnapshot(await Purchases.restorePurchases());
    },

    async refresh() {
      return toSnapshot(await Purchases.getCustomerInfo());
    },

    onChange(listener) {
      const cb = (info: CustomerInfo) => listener(toSnapshot(info));
      Purchases.addCustomerInfoUpdateListener(cb);
      return () => Purchases.removeCustomerInfoUpdateListener(cb);
    },
  };
}

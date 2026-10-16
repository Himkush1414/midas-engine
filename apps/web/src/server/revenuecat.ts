export const PRO_ENTITLEMENT = 'pro';

export interface RevenueCatEvent {
  type: string;
  app_user_id?: string;
  original_app_user_id?: string;
  aliases?: string[];
  product_id?: string;
  entitlement_ids?: string[] | null;
  entitlement_id?: string | null;
  expiration_at_ms?: number | null;
  period_type?: string;
  transferred_to?: string[];
  transferred_from?: string[];
}

export interface EntitlementRow {
  user_id: string;
  is_pro: boolean;
  plan: 'yearly' | 'monthly' | 'lifetime' | null;
  product_id: string | null;
  expires_at: string | null;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function planFromProduct(productId: string | undefined | null): EntitlementRow['plan'] {
  if (!productId) return null;
  if (productId.includes('lifetime')) return 'lifetime';
  if (productId.includes('year') || productId.includes('annual')) return 'yearly';
  if (productId.includes('month')) return 'monthly';
  return null;
}

/** Supabase user ids the event applies to (the app sets the RevenueCat app user id to the Supabase uid). */
export function targetUsers(e: RevenueCatEvent): string[] {
  if (e.type === 'TRANSFER') return (e.transferred_to ?? []).filter((id) => UUID.test(id));
  const ids = [e.app_user_id, e.original_app_user_id, ...(e.aliases ?? [])].filter((id): id is string => !!id && UUID.test(id));
  return [...new Set(ids)];
}

/** Maps a webhook event to the entitlement state to store, or null when the event doesn't change entitlements. */
export function entitlementFromEvent(e: RevenueCatEvent, userId: string, now = Date.now()): EntitlementRow | null {
  const ids = e.entitlement_ids ?? (e.entitlement_id ? [e.entitlement_id] : []);
  const grantsPro = ids.includes(PRO_ENTITLEMENT);
  const expiresAt = e.expiration_at_ms ?? null;
  const base = {
    user_id: userId,
    plan: planFromProduct(e.product_id),
    product_id: e.product_id ?? null,
    expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
  };
  switch (e.type) {
    case 'INITIAL_PURCHASE':
    case 'RENEWAL':
    case 'PRODUCT_CHANGE':
    case 'UNCANCELLATION':
    case 'NON_RENEWING_PURCHASE':
    case 'TRANSFER':
    case 'SUBSCRIPTION_EXTENDED':
    // Cancelled or in billing retry: access continues until the expiration date.
    case 'CANCELLATION':
    case 'BILLING_ISSUE':
      if (!grantsPro) return null;
      return { ...base, is_pro: expiresAt === null || expiresAt > now };
    case 'EXPIRATION':
      return { ...base, is_pro: false };
    default:
      return null; // TEST, SUBSCRIBER_ALIAS, SUBSCRIPTION_PAUSED, etc.
  }
}

/** Constant-time comparison for the shared webhook secret. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

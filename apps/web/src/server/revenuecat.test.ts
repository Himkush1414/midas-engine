import { describe, expect, it } from 'vitest';
import { entitlementFromEvent, planFromProduct, safeEqual, targetUsers } from './revenuecat';

const UID = '3f6a2c1e-8d4b-4f7a-9c2e-1b5d6e7f8a9b';
const NOW = Date.parse('2026-10-16T12:00:00Z');
const FUTURE = Date.parse('2026-10-23T12:00:00Z');
const PAST = Date.parse('2026-10-10T12:00:00Z');

describe('RevenueCat webhook mapping', () => {
  it('grants Pro on purchase and renewal', () => {
    for (const type of ['INITIAL_PURCHASE', 'RENEWAL', 'UNCANCELLATION']) {
      const row = entitlementFromEvent({ type, entitlement_ids: ['pro'], product_id: 'mindtier_pro_yearly', expiration_at_ms: FUTURE }, UID, NOW);
      expect(row).toMatchObject({ is_pro: true, plan: 'yearly', user_id: UID });
    }
  });

  it('keeps Pro after cancellation until the period ends', () => {
    expect(entitlementFromEvent({ type: 'CANCELLATION', entitlement_ids: ['pro'], expiration_at_ms: FUTURE }, UID, NOW)?.is_pro).toBe(true);
    expect(entitlementFromEvent({ type: 'CANCELLATION', entitlement_ids: ['pro'], expiration_at_ms: PAST }, UID, NOW)?.is_pro).toBe(false);
  });

  it('removes Pro on expiration', () => {
    expect(entitlementFromEvent({ type: 'EXPIRATION', entitlement_ids: ['pro'], expiration_at_ms: PAST }, UID, NOW)?.is_pro).toBe(false);
  });

  it('treats lifetime purchases as never expiring', () => {
    const row = entitlementFromEvent({ type: 'NON_RENEWING_PURCHASE', entitlement_ids: ['pro'], product_id: 'mindtier_pro_lifetime', expiration_at_ms: null }, UID, NOW);
    expect(row).toMatchObject({ is_pro: true, plan: 'lifetime', expires_at: null });
  });

  it('ignores events for other entitlements and informational events', () => {
    expect(entitlementFromEvent({ type: 'INITIAL_PURCHASE', entitlement_ids: ['other'] }, UID, NOW)).toBeNull();
    expect(entitlementFromEvent({ type: 'TEST', entitlement_ids: ['pro'] }, UID, NOW)).toBeNull();
  });

  it('only targets valid Supabase user ids and follows transfers', () => {
    expect(targetUsers({ type: 'RENEWAL', app_user_id: UID, aliases: ['$RCAnonymousID:abc', UID] })).toEqual([UID]);
    expect(targetUsers({ type: 'RENEWAL', app_user_id: 'not-a-uuid' })).toEqual([]);
    expect(targetUsers({ type: 'TRANSFER', transferred_to: [UID], app_user_id: 'x' })).toEqual([UID]);
  });

  it('classifies plans and compares secrets safely', () => {
    expect(planFromProduct('mindtier_pro_monthly:base-monthly')).toBe('monthly');
    expect(safeEqual('abc', 'abc')).toBe(true);
    expect(safeEqual('abc', 'abd')).toBe(false);
    expect(safeEqual('abc', 'abcd')).toBe(false);
  });
});

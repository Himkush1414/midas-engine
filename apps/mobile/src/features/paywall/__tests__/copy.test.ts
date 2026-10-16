import { REFERENCE_PLANS } from '@/lib/purchases/fallback';
import { translate } from '@/i18n/core';
import { en } from '@/i18n/en';
import { ctaCopy, planDetail } from '../copy';

const t = ((key: string, params?: Record<string, string | number>) => translate(en, en, 'en', key, params)) as never;

const [yearly, monthly, lifetime] = REFERENCE_PLANS as [any, any, any];
const now = new Date('2026-10-16T12:00:00Z');

describe('paywall copy', () => {
  it('states trial length, price, conversion date and how to cancel', () => {
    const c = ctaCopy(t, yearly, now, 'Google Play', 'en-US');
    expect(c.button).toBe('Start 7-day free trial');
    expect(c.terms).toContain('$39.99/year');
    expect(c.terms).toMatch(/Oct 23, 2026/);
    expect(c.terms).toContain('Cancel anytime in Google Play');
  });

  it('describes monthly renewals without a trial', () => {
    const c = ctaCopy(t, monthly, now, 'Google Play', 'en-US');
    expect(c.button).toBe('Subscribe for $7.99/month');
    expect(c.terms).toContain('Renews automatically');
  });

  it('marks lifetime as a one-time purchase', () => {
    const c = ctaCopy(t, lifetime, now, 'Google Play', 'en-US');
    expect(c.terms).toContain('No subscription');
    expect(planDetail(t, lifetime)).toBe('$79.99 once');
  });

  it('names the App Store on iOS', () => {
    expect(ctaCopy(t, monthly, now, 'the App Store', 'en-US').terms).toContain('the App Store');
  });
});

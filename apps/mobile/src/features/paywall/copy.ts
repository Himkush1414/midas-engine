import type { PlanOffer } from '@/lib/purchases';

export interface CtaCopy {
  button: string;
  /** Exact terms shown under the button (Play policy: price, period, trial conversion, how to cancel). */
  terms: string;
}

const PERIOD: Record<PlanOffer['kind'], string> = { yearly: 'year', monthly: 'month', lifetime: '' };

export function formatDay(date: Date): string {
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function ctaCopy(plan: PlanOffer, now: Date = new Date(), store = 'Google Play'): CtaCopy {
  if (plan.kind === 'lifetime') {
    return {
      button: `Buy lifetime for ${plan.priceString}`,
      terms: `One-time purchase of ${plan.priceString}. No subscription, no renewals.`,
    };
  }
  const period = PERIOD[plan.kind];
  if (plan.trialDays) {
    const charge = new Date(now.getTime() + plan.trialDays * 86_400_000);
    return {
      button: `Start ${plan.trialDays}-day free trial`,
      terms: `Free for ${plan.trialDays} days, then ${plan.priceString}/${period} starting ${formatDay(charge)}. Renews every ${period} until cancelled. Cancel anytime in ${store} at least 24 hours before renewal; we’ll remind you 2 days before the trial ends.`,
    };
  }
  return {
    button: `Subscribe for ${plan.priceString}/${period}`,
    terms: `${plan.priceString} billed every ${period}. Renews automatically until cancelled. Cancel anytime in ${store} at least 24 hours before renewal.`,
  };
}

export function planTitle(kind: PlanOffer['kind']): string {
  return { yearly: 'Yearly', monthly: 'Monthly', lifetime: 'Lifetime' }[kind];
}

export function planDetail(plan: PlanOffer): string {
  if (plan.kind === 'lifetime') return `${plan.priceString} once`;
  if (plan.kind === 'yearly') return `${plan.priceString}/year${plan.pricePerMonthString ? ` · ${plan.pricePerMonthString}/mo` : ''}`;
  return `${plan.priceString}/month`;
}

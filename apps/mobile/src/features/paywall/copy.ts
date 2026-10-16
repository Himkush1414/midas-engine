import type { TFunction } from '@/i18n';
import type { PlanOffer } from '@/lib/purchases';

export interface CtaCopy {
  button: string;
  /** Exact terms shown under the button (Play policy: price, period, trial conversion, how to cancel). */
  terms: string;
}

export function formatDay(date: Date, locale?: string): string {
  return date.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function ctaCopy(t: TFunction, plan: PlanOffer, now: Date = new Date(), store = 'Google Play', locale?: string): CtaCopy {
  if (plan.kind === 'lifetime') {
    return { button: t('paywall.buyLifetime', { price: plan.priceString }), terms: t('paywall.termsLifetime', { price: plan.priceString }) };
  }
  const period = plan.kind === 'yearly' ? t('paywall.year') : t('paywall.month');
  if (plan.trialDays) {
    const charge = new Date(now.getTime() + plan.trialDays * 86_400_000);
    return {
      button: t('paywall.trialButton', { days: plan.trialDays }),
      terms: t('paywall.termsTrial', { days: plan.trialDays, price: plan.priceString, period, date: formatDay(charge, locale), store }),
    };
  }
  return {
    button: t(plan.kind === 'yearly' ? 'paywall.subscribeYearly' : 'paywall.subscribeMonthly', { price: plan.priceString }),
    terms: t('paywall.termsSub', { price: plan.priceString, period, store }),
  };
}

export function planTitle(t: TFunction, kind: PlanOffer['kind']): string {
  return { yearly: t('paywall.yearly'), monthly: t('paywall.monthly'), lifetime: t('paywall.lifetime') }[kind];
}

export function planDetail(t: TFunction, plan: PlanOffer): string {
  if (plan.kind === 'lifetime') return t('paywall.once', { price: plan.priceString });
  if (plan.kind === 'yearly') {
    return plan.pricePerMonthString
      ? t('paywall.perYearMonthly', { price: plan.priceString, monthly: plan.pricePerMonthString })
      : t('paywall.perYear', { price: plan.priceString });
  }
  return t('paywall.perMonth', { price: plan.priceString });
}

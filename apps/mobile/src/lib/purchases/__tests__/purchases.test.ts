import { createFallbackProvider } from '../fallback';
import { periodToDays, planKindFor } from '../types';

describe('periodToDays', () => {
  it.each([
    ['P7D', 7],
    ['P1W', 7],
    ['P2W', 14],
    ['P1M', 30],
    ['P1Y', 365],
    ['P1M3D', 33],
  ])('%s → %i', (iso, days) => expect(periodToDays(iso)).toBe(days));

  it('rejects junk and empty periods', () => {
    expect(periodToDays(null)).toBeNull();
    expect(periodToDays('7 days')).toBeNull();
    expect(periodToDays('P0D')).toBeNull();
  });
});

describe('planKindFor', () => {
  it('classifies product ids', () => {
    expect(planKindFor('mindtier_pro_yearly')).toBe('yearly');
    expect(planKindFor('mindtier_pro_monthly:base')).toBe('monthly');
    expect(planKindFor('mindtier_pro_lifetime')).toBe('lifetime');
    expect(planKindFor('something')).toBeNull();
  });
});

describe('fallback provider', () => {
  it('never grants Pro when simulation is off (release without a store key)', async () => {
    const p = createFallbackProvider(false);
    const plans = await p.getPlans();
    expect(plans.map((x) => x.kind)).toEqual(['yearly', 'monthly', 'lifetime']);
    const outcome = await p.purchase(plans[0]!.id);
    expect(outcome.status).toBe('failed');
    expect((await p.refresh()).isPro).toBe(false);
  });

  it('simulates the full flow in development', async () => {
    const p = createFallbackProvider(true);
    const seen: boolean[] = [];
    p.onChange((e) => seen.push(e.isPro));
    const outcome = await p.purchase('$rc_annual');
    expect(outcome.status).toBe('purchased');
    expect(seen).toEqual([true]);
    const restored = await p.restore();
    expect(restored).toMatchObject({ isPro: true, plan: 'yearly', inTrial: true });
  });
});

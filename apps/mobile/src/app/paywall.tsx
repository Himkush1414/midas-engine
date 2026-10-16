import { router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, View } from 'react-native';
import { Icon, type IconName } from '@/components/icons/Icon';
import { TierBadge } from '@/components/tier';
import { Button, PressableScale, Screen, Text } from '@/components/ui';
import { ctaCopy, planDetail, planTitle } from '@/features/paywall/copy';
import { track } from '@/lib/analytics';
import { links } from '@/lib/links';
import { scheduleTrialReminder } from '@/lib/notifications';
import { applyEntitlement, purchases, type PlanOffer } from '@/lib/purchases';
import { radii, spacing, useTheme } from '@/theme';

const BENEFITS: { icon: IconName; text: string }[] = [
  { icon: 'badge', text: 'Unlimited ranked sessions — climb as fast as you like' },
  { icon: 'focus', text: 'Focus training: pick any domain and drill it' },
  { icon: 'zen', text: 'All 13 games in untimed Zen mode' },
  { icon: 'chart', text: 'Full rating history, percentiles and trends' },
  { icon: 'duel', text: 'Unlimited duel challenges' },
];

const ALWAYS_FREE = 'Always free: a daily ranked session, the Daily Challenge, duels with friends — and no ads, ever.';

const PREVIEW_BADGE = { tier: 'diamond' as const, division: 2 as const, label: 'Diamond II', provisional: false };

export default function Paywall() {
  const { colors } = useTheme();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const [plans, setPlans] = useState<PlanOffer[] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState<'buy' | 'restore' | null>(null);

  useEffect(() => {
    track('paywall_viewed', { from: from ?? 'unknown' });
    purchases
      .getPlans()
      .then((p) => {
        setPlans(p);
        setSelected((p.find((x) => x.kind === 'yearly') ?? p[0])?.id ?? null);
      })
      .catch(() => setPlans([]));
  }, [from]);

  const close = () => {
    track('paywall_dismissed', { from: from ?? 'unknown' });
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  const plan = plans?.find((p) => p.id === selected) ?? null;
  const store = Platform.OS === 'ios' ? 'the App Store' : 'Google Play';
  const copy = plan ? ctaCopy(plan, new Date(), store) : null;

  const buy = async () => {
    if (!plan) return;
    setBusy('buy');
    track('purchase_started', { plan: plan.kind });
    const outcome = await purchases.purchase(plan.id);
    setBusy(null);
    if (outcome.status === 'purchased') {
      applyEntitlement(outcome.entitlement);
      track('purchase_completed', { plan: plan.kind, trial: Boolean(plan.trialDays) });
      if (plan.trialDays && outcome.entitlement.expiresAt) {
        void scheduleTrialReminder(new Date(outcome.entitlement.expiresAt), plan.priceString);
      }
      close();
    } else if (outcome.status === 'pending') {
      Alert.alert('Almost there', outcome.message);
    } else if (outcome.status === 'failed') {
      Alert.alert('Purchase didn’t go through', outcome.message);
    }
  };

  const restore = async () => {
    setBusy('restore');
    try {
      const e = await purchases.restore();
      applyEntitlement(e);
      Alert.alert(e.isPro ? 'Pro restored' : 'Nothing to restore', e.isPro ? 'Welcome back.' : `No active Pro purchase was found for this ${store} account.`);
      if (e.isPro) close();
    } catch {
      Alert.alert('Couldn’t restore', 'Check your connection and try again.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <Screen
      scroll
      edges={['top', 'left', 'right', 'bottom']}
      footer={
        <View style={styles.footer}>
          <Button label={copy?.button ?? 'Continue'} size="lg" fullWidth loading={busy === 'buy'} disabled={!plan || busy !== null} onPress={buy} testID="paywall-buy" />
          {copy ? (
            <Text variant="caption" tone="faint" align="center">
              {copy.terms}
            </Text>
          ) : null}
          <View style={styles.links}>
            <Text variant="caption" tone="primary" onPress={restore} accessibilityRole="button">
              {busy === 'restore' ? 'Restoring…' : 'Restore purchases'}
            </Text>
            <Text variant="caption" tone="faint">·</Text>
            <Text variant="caption" tone="primary" onPress={() => WebBrowser.openBrowserAsync(links.terms)} accessibilityRole="link">
              Terms
            </Text>
            <Text variant="caption" tone="faint">·</Text>
            <Text variant="caption" tone="primary" onPress={() => WebBrowser.openBrowserAsync(links.privacy)} accessibilityRole="link">
              Privacy
            </Text>
          </View>
        </View>
      }
    >
      <View style={styles.top}>
        <PressableScale onPress={close} accessibilityLabel="Close" style={[styles.close, { backgroundColor: colors.surfaceRaised }]} testID="paywall-close">
          <Icon name="close" size={22} color={colors.text} />
        </PressableScale>
      </View>

      <View style={styles.hero}>
        <TierBadge info={PREVIEW_BADGE} size={96} />
        <Text variant="title" align="center">
          Mindtier Pro
        </Text>
        <Text tone="muted" align="center">
          {from === 'placement' ? 'You’ve got your tier. Keep climbing without limits.' : 'Climb without limits.'}
        </Text>
      </View>

      <View style={styles.benefits}>
        {BENEFITS.map((b) => (
          <View key={b.text} style={styles.benefit}>
            <View style={[styles.benefitIcon, { backgroundColor: colors.surfaceRaised }]}>
              <Icon name={b.icon} size={20} color={colors.primaryText} />
            </View>
            <Text style={styles.flex}>{b.text}</Text>
          </View>
        ))}
      </View>

      <View style={styles.plans} accessibilityRole="radiogroup">
        {plans === null ? (
          <ActivityIndicator color={colors.primaryText} />
        ) : plans.length === 0 ? (
          <Text tone="muted" align="center">
            Plans couldn’t load. Check your connection and try again.
          </Text>
        ) : (
          plans.map((p) => {
            const active = p.id === selected;
            return (
              <PressableScale
                key={p.id}
                onPress={() => setSelected(p.id)}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                accessibilityLabel={`${planTitle(p.kind)}, ${planDetail(p)}${p.trialDays ? `, ${p.trialDays}-day free trial` : ''}`}
                style={[styles.plan, { borderColor: active ? colors.primaryText : colors.border, backgroundColor: active ? colors.surfaceRaised : colors.surface }]}
                testID={`plan-${p.kind}`}
              >
                <View style={[styles.radio, { borderColor: active ? colors.primaryText : colors.borderStrong }]}>
                  {active ? <View style={[styles.radioDot, { backgroundColor: colors.primaryText }]} /> : null}
                </View>
                <View style={styles.flex}>
                  <Text weight="semibold">{planTitle(p.kind)}</Text>
                  <Text variant="caption" tone="muted" tabular>
                    {planDetail(p)}
                  </Text>
                </View>
                {p.trialDays ? (
                  <View style={[styles.pill, { backgroundColor: colors.primary }]}>
                    <Text variant="caption" weight="bold" style={{ color: colors.onPrimary }}>
                      {p.trialDays} days free
                    </Text>
                  </View>
                ) : null}
              </PressableScale>
            );
          })
        )}
      </View>

      <Text variant="caption" tone="muted" align="center" style={styles.free}>
        {ALWAYS_FREE}
      </Text>
      {!purchases.live ? (
        <Text variant="caption" tone="warning" align="center">
          {__DEV__ ? 'Test build: purchases are simulated and no money is charged.' : 'Purchases aren’t available in this build yet.'}
        </Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  top: { flexDirection: 'row', justifyContent: 'flex-end', paddingTop: spacing.sm },
  close: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  hero: { alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  benefits: { gap: spacing.md, marginTop: spacing.xl },
  benefit: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  benefitIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  plans: { gap: spacing.sm, marginTop: spacing.xl },
  plan: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderWidth: 2, borderRadius: radii.lg, padding: spacing.lg, minHeight: 64 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  pill: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radii.pill },
  free: { marginTop: spacing.lg },
  footer: { gap: spacing.sm },
  links: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm },
});

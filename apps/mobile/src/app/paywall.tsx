import { router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, View } from 'react-native';
import { Icon, type IconName } from '@/components/icons/Icon';
import { TierBadge } from '@/components/tier';
import { Button, PressableScale, Screen, Text } from '@/components/ui';
import { ctaCopy, planDetail, planTitle } from '@/features/paywall/copy';
import { useLanguage, useT, type TKey } from '@/i18n';
import { track } from '@/lib/analytics';
import { links } from '@/lib/links';
import { scheduleTrialReminder } from '@/lib/notifications';
import { applyEntitlement, purchases, type PlanOffer } from '@/lib/purchases';
import { radii, spacing, useTheme } from '@/theme';

const BENEFITS: { icon: IconName; text: TKey }[] = [
  { icon: 'badge', text: 'paywall.benefitRanked' },
  { icon: 'focus', text: 'paywall.benefitFocus' },
  { icon: 'zen', text: 'paywall.benefitZen' },
  { icon: 'chart', text: 'paywall.benefitHistory' },
  { icon: 'duel', text: 'paywall.benefitDuels' },
];

const PREVIEW_BADGE = { tier: 'diamond' as const, division: 2 as const, label: 'Diamond II', provisional: false };

export default function Paywall() {
  const { colors } = useTheme();
  const t = useT();
  const language = useLanguage();
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
  const store = Platform.OS === 'ios' ? t('paywall.appStore') : t('paywall.googlePlay');
  const copy = plan ? ctaCopy(t, plan, new Date(), store, language) : null;

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
      Alert.alert(t('paywall.almostThere'), outcome.message);
    } else if (outcome.status === 'failed') {
      Alert.alert(t('paywall.failedTitle'), outcome.message);
    }
  };

  const restore = async () => {
    setBusy('restore');
    try {
      const e = await purchases.restore();
      applyEntitlement(e);
      Alert.alert(e.isPro ? t('paywall.restoredTitle') : t('paywall.nothingTitle'), e.isPro ? t('paywall.restoredBody') : t('paywall.nothingBody', { store }));
      if (e.isPro) close();
    } catch {
      Alert.alert(t('paywall.restoreFailedTitle'), t('paywall.restoreFailedBody'));
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
          <Button label={copy?.button ?? t('paywall.continue')} size="lg" fullWidth loading={busy === 'buy'} disabled={!plan || busy !== null} onPress={buy} testID="paywall-buy" />
          {copy ? (
            <Text variant="caption" tone="faint" align="center">
              {copy.terms}
            </Text>
          ) : null}
          <View style={styles.links}>
            <Text variant="caption" tone="primary" onPress={restore} accessibilityRole="button">
              {busy === 'restore' ? t('paywall.restoring') : t('paywall.restore')}
            </Text>
            <Text variant="caption" tone="faint">·</Text>
            <Text variant="caption" tone="primary" onPress={() => WebBrowser.openBrowserAsync(links.terms)} accessibilityRole="link">
              {t('paywall.terms')}
            </Text>
            <Text variant="caption" tone="faint">·</Text>
            <Text variant="caption" tone="primary" onPress={() => WebBrowser.openBrowserAsync(links.privacy)} accessibilityRole="link">
              {t('paywall.privacy')}
            </Text>
          </View>
        </View>
      }
    >
      <View style={styles.top}>
        <PressableScale onPress={close} accessibilityLabel={t('common.close')} style={[styles.close, { backgroundColor: colors.surfaceRaised }]} testID="paywall-close">
          <Icon name="close" size={22} color={colors.text} />
        </PressableScale>
      </View>

      <View style={styles.hero}>
        <TierBadge info={PREVIEW_BADGE} size={96} />
        <Text variant="title" align="center">
          {t('paywall.title')}
        </Text>
        <Text tone="muted" align="center">
          {from === 'placement' ? t('paywall.afterPlacement') : t('paywall.tagline')}
        </Text>
      </View>

      <View style={styles.benefits}>
        {BENEFITS.map((b) => (
          <View key={b.text} style={styles.benefit}>
            <View style={[styles.benefitIcon, { backgroundColor: colors.surfaceRaised }]}>
              <Icon name={b.icon} size={20} color={colors.primaryText} />
            </View>
            <Text style={styles.flex}>{t(b.text)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.plans} accessibilityRole="radiogroup">
        {plans === null ? (
          <ActivityIndicator color={colors.primaryText} />
        ) : plans.length === 0 ? (
          <Text tone="muted" align="center">
            {t('paywall.loadFailed')}
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
                accessibilityLabel={`${t('paywall.planA11y', { plan: planTitle(t, p.kind), detail: planDetail(t, p) })}${p.trialDays ? t('paywall.trialA11y', { days: p.trialDays }) : ''}`}
                style={[styles.plan, { borderColor: active ? colors.primaryText : colors.border, backgroundColor: active ? colors.surfaceRaised : colors.surface }]}
                testID={`plan-${p.kind}`}
              >
                <View style={[styles.radio, { borderColor: active ? colors.primaryText : colors.borderStrong }]}>
                  {active ? <View style={[styles.radioDot, { backgroundColor: colors.primaryText }]} /> : null}
                </View>
                <View style={styles.flex}>
                  <Text weight="semibold">{planTitle(t, p.kind)}</Text>
                  <Text variant="caption" tone="muted" tabular>
                    {planDetail(t, p)}
                  </Text>
                </View>
                {p.trialDays ? (
                  <View style={[styles.pill, { backgroundColor: colors.primary }]}>
                    <Text variant="caption" weight="bold" style={{ color: colors.onPrimary }}>
                      {t('paywall.daysFree', { days: p.trialDays })}
                    </Text>
                  </View>
                ) : null}
              </PressableScale>
            );
          })
        )}
      </View>

      <Text variant="caption" tone="muted" align="center" style={styles.free}>
        {t('paywall.alwaysFree')}
      </Text>
      {!purchases.live ? (
        <Text variant="caption" tone="warning" align="center">
          {__DEV__ ? t('paywall.testBuild') : t('paywall.unavailableBuild')}
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

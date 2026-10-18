import { router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Icon } from '@/components/icons/Icon';
import { TierBadge } from '@/components/tier';
import { Button, Enter, LipPressable, PressableScale, Screen, Text } from '@/components/ui';
import { ctaCopy, planDetail, planTitle } from '@/features/paywall/copy';
import { useLanguage, useT, type TKey } from '@/i18n';
import { track } from '@/lib/analytics';
import { links } from '@/lib/links';
import { scheduleTrialReminder } from '@/lib/notifications';
import { applyEntitlement, purchases, type PlanOffer } from '@/lib/purchases';
import { lips, radii, SLANT_DEG, spacing, tierColors, useTheme } from '@/theme';

const BENEFITS: TKey[] = [
  'paywall.benefitRanked',
  'paywall.benefitFocus',
  'paywall.benefitZen',
  'paywall.benefitHistory',
  'paywall.benefitDuels',
];

/** What Pro climbs towards: gold, diamond and master, fanned like a hand of cards. */
const FAN = (['gold', 'diamond', 'master'] as const).map((tier) => ({ tier, division: null, label: tier, provisional: false }));

export default function Paywall() {
  const { colors } = useTheme();
  const t = useT();
  const language = useLanguage();
  const { height } = useWindowDimensions();
  // Short phones keep the plans closer to the fold.
  const titleSize = Math.round(Math.min(72, Math.max(48, height * 0.09)));
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
        <Enter index={0} style={styles.fan}>
          {FAN.map((info, i) => (
            <View key={info.tier} style={[styles.fanItem, { transform: [{ rotate: `${(i - 1) * 12}deg` }, { translateY: i === 1 ? -10 : 6 }], zIndex: i === 1 ? 1 : 0 }]}>
              {i === 1 ? <View style={[styles.glow, { boxShadow: `0 0 60px 12px ${tierColors.diamond.base}66` }]} /> : null}
              <TierBadge info={info} size={i === 1 ? 112 : 84} shine={i === 1} />
            </View>
          ))}
        </Enter>
        <Enter index={1} style={styles.titleRow}>
          <Text variant="mega" accessibilityRole="header" style={[{ fontSize: titleSize, lineHeight: titleSize * 0.92 }]}>
            {t('paywall.title')}
          </Text>
        </Enter>
        <Enter index={2}>
          <Text variant="subheading" tone="muted" weight="regular">
            {from === 'placement' ? t('paywall.afterPlacement') : t('paywall.tagline')}
          </Text>
        </Enter>
      </View>

      <Enter index={3} style={styles.benefits}>
        {BENEFITS.map((b) => (
          <View key={b} style={styles.benefit}>
            <View style={[styles.tick, { backgroundColor: colors.primaryText }]} />
            <Text weight="medium" style={styles.flex}>
              {t(b)}
            </Text>
          </View>
        ))}
      </Enter>

      <View style={styles.plans} accessibilityRole="radiogroup">
        {plans === null ? (
          <ActivityIndicator color={colors.primaryText} />
        ) : plans.length === 0 ? (
          <Text tone="muted" align="center">
            {t('paywall.loadFailed')}
          </Text>
        ) : (
          plans.map((p, i) => {
            const active = p.id === selected;
            return (
              <Enter key={p.id} index={4 + i}>
                <LipPressable
                  onPress={() => setSelected(p.id)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={`${t('paywall.planA11y', { plan: planTitle(t, p.kind), detail: planDetail(t, p) })}${p.trialDays ? t('paywall.trialA11y', { days: p.trialDays }) : ''}`}
                  face={active ? colors.surfaceRaised : colors.surface}
                  lipColor={active ? colors.primaryText : colors.lip}
                  lip={lips.sm}
                  radius={radii.md}
                  faceStyle={[styles.plan, { borderColor: active ? colors.primaryText : 'transparent' }]}
                  testID={`plan-${p.kind}`}
                >
                  <View style={[styles.radio, { borderColor: active ? colors.primaryText : colors.borderStrong, backgroundColor: active ? colors.primaryText : 'transparent' }]}>
                    {active ? <Icon name="check" size={14} color={colors.background} strokeWidth={3} /> : null}
                  </View>
                  <View style={styles.flex}>
                    <Text variant="heading">{planTitle(t, p.kind)}</Text>
                    <Text variant="caption" tone="muted" tabular>
                      {planDetail(t, p)}
                    </Text>
                  </View>
                  {p.trialDays ? (
                    <View style={[styles.tag, { backgroundColor: colors.primary }]}>
                      <Text variant="micro" weight="bold" style={[styles.unskew, { color: colors.onPrimary }]}>
                        {t('paywall.daysFree', { days: p.trialDays })}
                      </Text>
                    </View>
                  ) : null}
                </LipPressable>
              </Enter>
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
  close: { width: 48, height: 48, borderRadius: radii.sm, alignItems: 'center', justifyContent: 'center' },
  hero: { gap: spacing.md },
  fan: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 140, marginBottom: spacing.sm },
  fanItem: { marginHorizontal: -10, alignItems: 'center', justifyContent: 'center' },
  glow: { position: 'absolute', width: 70, height: 70, borderRadius: 70 },
  titleRow: { flexDirection: 'row' },
  benefits: { gap: spacing.md, marginTop: spacing.xl },
  benefit: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  tick: { width: 14, height: 8, borderRadius: 1, transform: [{ skewX: `${SLANT_DEG}deg` }] },
  plans: { gap: spacing.sm, marginTop: spacing.xl },
  plan: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderWidth: 2, borderRadius: radii.md, padding: spacing.lg, minHeight: 72 },
  radio: { width: 24, height: 24, borderRadius: radii.xs, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  tag: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radii.xs, transform: [{ skewX: `${SLANT_DEG}deg` }] },
  unskew: { transform: [{ skewX: `${-SLANT_DEG}deg` }] },
  free: { marginTop: spacing.lg },
  footer: { gap: spacing.sm },
  links: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm },
});

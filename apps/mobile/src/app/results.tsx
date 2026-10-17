import { overallRating, tierChange, tierInfo } from '@mindtier/core';
import { Redirect, router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { Celebration } from '@/components/Celebration';
import { TierBadge } from '@/components/tier';
import { Button, Card, Screen, Text } from '@/components/ui';
import { shareDuel } from '@/features/duels/actions';
import { DeltaRow } from '@/features/results/DeltaRow';
import { webPlay } from '@/lib/config';
import { haptic } from '@/lib/feedback';
import { useReduceMotion } from '@/lib/motion';
import { maybeAskForReview } from '@/lib/review';
import { play } from '@/lib/sound';
import { useT, type TKey } from '@/i18n';
import { tierLabel } from '@/i18n/labels';
import { useEntitlements } from '@/state/entitlements';
import { useSession } from '@/state/session';
import { spacing, tierColors } from '@/theme';

function isPromotion(f: { plan: { mode: string }; ratingsBefore: Parameters<typeof overallRating>[0]; result: { ratings: Parameters<typeof overallRating>[0] } }): boolean {
  if (f.plan.mode !== 'ranked' && f.plan.mode !== 'placement') return false;
  const change = tierChange(overallRating(f.ratingsBefore), overallRating(f.result.ratings));
  return change === 'tier-up' || change === 'promoted';
}

const PROMOTION_COPY: Record<string, TKey | null> = {
  'tier-up': 'results.tierUp',
  promoted: 'results.divisionUp',
  demoted: 'results.divisionDown',
  'tier-down': 'results.tierDown',
  none: null,
};

export default function Results() {
  const reduce = useReduceMotion();
  const t = useT();
  const finished = useSession((s) => s.finished);
  const isPro = useEntitlements((s) => s.isPro);
  const promoted = finished ? isPromotion(finished) : false;
  useEffect(() => {
    if (promoted) {
      haptic.success();
      play('rankup');
      // Give the celebration a moment before the system review sheet may appear.
      const timer = setTimeout(() => void maybeAskForReview(), 2500);
      return () => clearTimeout(timer);
    }
  }, [promoted]);
  if (!finished) return <Redirect href="/" />;

  const { plan, result, runs, ratingsBefore } = finished;
  const rated = plan.mode === 'ranked' || plan.mode === 'placement';
  const before = overallRating(ratingsBefore);
  const after = overallRating(result.ratings);
  const info = tierInfo(after);
  const change = rated ? tierChange(before, after) : 'none';
  const overallDelta = Math.round(after.rating) - Math.round(before.rating);
  const points = runs.reduce((s, r) => s + r.points, 0);
  const celebrate = change === 'tier-up' || change === 'promoted';
  const c = tierColors[info.tier];

  const done = () => {
    useSession.getState().clearFinished();
    router.dismissTo(webPlay ? '/today' : '/');
  };

  return (
    <Screen
      scroll
      edges={['top', 'left', 'right', 'bottom']}
      footer={
        <View style={styles.footer}>
          {plan.mode === 'daily' ? (
            <Button label={t('results.board')} size="lg" fullWidth icon="trophy" onPress={() => router.replace(webPlay ? '/today' : '/daily')} />
          ) : null}
          {plan.mode === 'duel' ? (
            <Button
              label={t('results.sendFriend')}
              size="lg"
              fullWidth
              icon="share"
              onPress={() => {
                const id = plan.seed.split('|')[1];
                if (id) shareDuel(id);
              }}
            />
          ) : null}
          <Button label={t('common.done')} size="lg" variant={plan.mode === 'daily' || plan.mode === 'duel' ? 'secondary' : 'primary'} fullWidth onPress={done} testID="results-done" />
        </View>
      }
    >
      <View style={styles.hero}>
        <Animated.View entering={reduce ? undefined : ZoomIn.springify().damping(12)}>
          <TierBadge info={info} size={132} showProvisional={false} />
        </Animated.View>
        {celebrate ? <Celebration colors={[c.highlight, c.base, '#FFFFFF']} reduceMotion={reduce} top={40} /> : null}
        {rated ? (
          <>
            {PROMOTION_COPY[change] ? (
              <Text variant="label" tone={celebrate ? 'spark' : 'muted'} align="center">
                {t(PROMOTION_COPY[change]!)}
              </Text>
            ) : null}
            <Text variant="title" align="center">
              {tierLabel(t, info)}
            </Text>
            <Text tone="muted" align="center" tabular>
              {t('results.mindRating', { rating: Math.round(after.rating), delta: `${overallDelta >= 0 ? '+' : '−'}${Math.abs(overallDelta)}` })}
            </Text>
          </>
        ) : (
          <>
            <Text variant="title" align="center" tabular>
              {plan.mode === 'zen' ? t('results.accuracy', { percent: Math.round((runs[0]?.accuracy ?? 0) * 100) }) : t('common.points', { points })}
            </Text>
            <Text tone="muted" align="center">
              {plan.mode === 'daily' ? t('results.dailyDone') : plan.mode === 'duel' ? t('results.duelDone') : t('results.zenDone')}
            </Text>
          </>
        )}
      </View>

      {rated ? (
        <View style={styles.list}>
          {result.updates.map((u, i) => (
            <DeltaRow key={`${u.gameId}-${i}`} update={u} index={i} reduceMotion={reduce} />
          ))}
        </View>
      ) : (
        <View style={styles.list}>
          {runs.map((r, i) => (
            <Card key={`${r.gameId}-${i}`}>
              <Text weight="semibold">{t('results.accuracy', { percent: Math.round(r.accuracy * 100) })}</Text>
              <Text variant="caption" tone="muted" tabular>
                {plan.mode === 'zen' ? t('results.reached', { level: Math.max(1, r.peakLevel) }) : t('results.pointsPeak', { points: r.points, level: r.peakLevel })}
              </Text>
            </Card>
          ))}
        </View>
      )}

      {plan.mode === 'ranked' && !isPro ? (
        <Card style={styles.upsell} onPress={() => router.push('/paywall')} accessibilityLabel={t('paywall.title')}>
          <Text weight="semibold">{t('results.upsellTitle')}</Text>
          <Text variant="caption" tone="muted">
            {t('results.upsellBody')}
          </Text>
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: spacing.sm, paddingTop: spacing.xl, paddingBottom: spacing.lg },
  list: { gap: spacing.sm },
  upsell: { marginTop: spacing.lg, gap: spacing.xs },
  footer: { gap: spacing.sm },
});

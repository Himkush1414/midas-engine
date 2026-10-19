import { getGame, overallRating, tierChange, tierInfo } from '@mindtier/core';
import { Redirect, router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { Celebration } from '@/components/Celebration';
import { TierBadge } from '@/components/tier';
import { Button, Enter, fitDisplaySize, MAX_CONTENT_WIDTH, ProgressBar, RollingNumber, Screen, Text, Ticket } from '@/components/ui';
import { shareDuel } from '@/features/duels/actions';
import { DeltaRow } from '@/features/results/DeltaRow';
import { StreakStamp } from '@/features/results/StreakStamp';
import { webPlay } from '@/lib/config';
import { haptic } from '@/lib/feedback';
import { useReduceMotion } from '@/lib/motion';
import { maybeAskForReview } from '@/lib/review';
import { play } from '@/lib/sound';
import { useLanguage, useT, type TKey } from '@/i18n';
import { tierLabel } from '@/i18n/labels';
import { useEntitlements } from '@/state/entitlements';
import { useSession } from '@/state/session';
import { onColor, radii, SLANT_DEG, spacing, springs, tierColors, useTheme } from '@/theme';

function isPromotion(f: { plan: { mode: string }; ratingsBefore: Parameters<typeof overallRating>[0]; result: { ratings: Parameters<typeof overallRating>[0] } }): boolean {
  if (f.plan.mode !== 'ranked' && f.plan.mode !== 'placement') return false;
  const change = tierChange(overallRating(f.ratingsBefore), overallRating(f.result.ratings));
  return change === 'tier-up' || change === 'promoted';
}

function gainedRating(f: { plan: { mode: string }; ratingsBefore: Parameters<typeof overallRating>[0]; result: { ratings: Parameters<typeof overallRating>[0] } }): boolean {
  if (f.plan.mode !== 'ranked' && f.plan.mode !== 'placement') return false;
  return Math.round(overallRating(f.result.ratings).rating) > Math.round(overallRating(f.ratingsBefore).rating);
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
  const locale = useLanguage();
  const { width } = useWindowDimensions();
  const { colors, domain: domainColor } = useTheme();
  const finished = useSession((s) => s.finished);
  const isPro = useEntitlements((s) => s.isPro);
  const promoted = finished ? isPromotion(finished) : false;
  const gained = finished ? gainedRating(finished) : false;
  useEffect(() => {
    // A plain rating gain lands with the roll: one bright note and a success tap.
    if (!promoted && gained) {
      const timer = setTimeout(() => {
        play('correct');
        haptic.success();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [promoted, gained]);
  useEffect(() => {
    if (promoted) {
      haptic.heavy();
      play('rankup');
      const settle = setTimeout(() => haptic.success(), 450);
      // Give the celebration a moment before the system review sheet may appear.
      const timer = setTimeout(() => void maybeAskForReview(), 2500);
      return () => {
        clearTimeout(settle);
        clearTimeout(timer);
      };
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
  // The score and its unit share one line: leave room for the unit (about 56 pt) on narrow phones.
  const pointsSize = fitDisplaySize(points.toLocaleString(locale), Math.min(width, MAX_CONTENT_WIDTH) - spacing.gutter * 2 - 56, 104, 64);
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
        {celebrate ? <Celebration colors={[c.highlight, c.base, '#FFFFFF']} reduceMotion={reduce} top={60} /> : null}
        {rated ? (
          <>
            {PROMOTION_COPY[change] ? (
              <Animated.View
                entering={reduce ? undefined : ZoomIn.springify().damping(springs.slam.damping).stiffness(springs.slam.stiffness)}
                style={[styles.stamp, { backgroundColor: celebrate ? colors.spark : colors.surfaceRaised }]}
              >
                <Text variant="heading" style={[styles.unskew, { color: celebrate ? onColor(colors.spark) : colors.textMuted }]}>
                  {t(PROMOTION_COPY[change]!)}
                </Text>
              </Animated.View>
            ) : null}
            <View style={styles.scoreRow}>
              <Animated.View
                entering={reduce ? undefined : ZoomIn.springify().damping(springs.slam.damping).stiffness(springs.slam.stiffness)}
                style={styles.badge}
              >
                <View style={[styles.glow, { boxShadow: `0 0 56px 10px ${c.base}66` }]} />
                <TierBadge info={info} size={124} showProvisional={false} shine={celebrate} />
              </Animated.View>
              <View style={styles.scoreText}>
                <Text variant="micro" tone="muted">
                  {t('home.ratingLabel')}
                </Text>
                <RollingNumber
                  value={`${overallDelta >= 0 ? '+' : '−'}${Math.abs(overallDelta)}`}
                  variant="mega"
                  style={[styles.delta, { color: overallDelta > 0 ? colors.success : overallDelta < 0 ? colors.danger : colors.textMuted }]}
                  accessibilityLabel={t('results.mindRating', {
                    rating: Math.round(after.rating),
                    delta: `${overallDelta >= 0 ? '+' : '−'}${Math.abs(overallDelta)}`,
                  })}
                />
                <Text variant="micro" tone="muted" tabular>
                  {Math.round(after.rating)}
                </Text>
              </View>
            </View>
            <Text variant="title" style={{ color: c.base }}>
              {tierLabel(t, info)}
            </Text>
            <ProgressBar value={info.progress} color={c.base} segments={10} height={12} accessibilityLabel={t('home.progressA11y')} />
          </>
        ) : (
          <>
            <Text variant="micro" tone="muted">
              {plan.mode === 'daily' ? t('results.dailyDone') : plan.mode === 'duel' ? t('results.duelDone') : t('results.zenDone')}
            </Text>
            {plan.mode === 'zen' ? (
              <View style={styles.pointsRow}>
                <RollingNumber value={String(Math.round((runs[0]?.accuracy ?? 0) * 100))} variant="mega" style={styles.points} />
                <Text variant="hero" tone="muted">
                  %
                </Text>
              </View>
            ) : (
              <View style={styles.pointsRow}>
                <RollingNumber value={points.toLocaleString(locale)} variant="mega" style={{ fontSize: pointsSize, lineHeight: Math.round(pointsSize * 0.9) }} />
                <Text variant="heading" tone="muted" style={styles.unit}>
                  {t('common.points', { points: '' }).trim()}
                </Text>
              </View>
            )}
          </>
        )}
      </View>

      {finished.streakExtendedTo ? (
        <View style={styles.streak}>
          <StreakStamp days={finished.streakExtendedTo} reduceMotion={reduce} />
        </View>
      ) : null}

      {rated ? (
        <View style={styles.list}>
          {result.updates.map((u, i) => (
            <DeltaRow key={`${u.gameId}-${i}`} update={u} index={i} />
          ))}
        </View>
      ) : (
        <View style={styles.list}>
          {runs.map((r, i) => {
            const game = getGame(r.gameId);
            return (
              <Enter key={`${r.gameId}-${i}`} index={i + 2}>
                <View style={[styles.run, { backgroundColor: colors.surface }]}>
                  <View style={[styles.tab, { backgroundColor: domainColor[game.domain] }]} />
                  <View style={styles.runText}>
                    <Text variant="heading" numberOfLines={1}>
                      {game.name}
                    </Text>
                    {/* Wrap between the "·" parts, never inside one, so a narrow phone never orphans the level. */}
                    <View style={styles.meta}>
                      {(plan.mode === 'zen' ? t('results.reached', { level: Math.max(1, r.peakLevel) }) : t('results.pointsPeak', { points: r.points.toLocaleString(locale), level: r.peakLevel }))
                        .split(' · ')
                        .map((part, j, parts) => (
                          <Text key={j} variant="micro" tone="muted" tabular style={styles.metaPart}>
                            {j < parts.length - 1 ? `${part} ·` : part}
                          </Text>
                        ))}
                    </View>
                  </View>
                  <Text variant="heading" tabular>
                    {Math.round(r.accuracy * 100)}%
                  </Text>
                </View>
              </Enter>
            );
          })}
        </View>
      )}

      {plan.mode === 'ranked' && !isPro ? (
        <Ticket
          kicker={t('paywall.title')}
          title={t('results.upsellTitle')}
          detail={t('results.upsellBody')}
          color={colors.spark}
          icon="sparkle"
          onPress={() => router.push('/paywall')}
          style={styles.upsell}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { gap: spacing.md, paddingTop: spacing.lg, paddingBottom: spacing.xl },
  stamp: { alignSelf: 'flex-start', paddingHorizontal: spacing.lg, paddingVertical: spacing.xs, borderRadius: radii.xs, transform: [{ skewX: `${SLANT_DEG}deg` }] },
  unskew: { transform: [{ skewX: `${-SLANT_DEG}deg` }] },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  badge: { width: 124, height: 124, alignItems: 'center', justifyContent: 'center' },
  glow: { position: 'absolute', width: 74, height: 74, borderRadius: 74 },
  scoreText: { flex: 1, gap: 2 },
  delta: { fontSize: 88, lineHeight: 80 },
  pointsRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm, flexWrap: 'wrap' },
  points: { fontSize: 104, lineHeight: 94 },
  unit: { marginBottom: spacing.sm },
  streak: { marginTop: -spacing.md, marginBottom: spacing.lg },
  list: { gap: spacing.sm },
  run: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderRadius: radii.md, padding: spacing.md, paddingLeft: spacing.lg, overflow: 'hidden' },
  tab: { position: 'absolute', left: -4, top: 0, bottom: 0, width: 10, transform: [{ skewX: `${SLANT_DEG}deg` }] },
  runText: { flex: 1, gap: 2 },
  meta: { flexDirection: 'row', flexWrap: 'wrap', columnGap: spacing.xs },
  metaPart: { flexShrink: 0 },
  upsell: { marginTop: spacing.lg },
  footer: { gap: spacing.sm },
});

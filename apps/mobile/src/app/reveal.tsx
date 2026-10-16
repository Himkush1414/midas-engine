import { DOMAINS, initialRatings, overallRating, tierInfo, type Domain } from '@mindtier/core';
import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { Celebration } from '@/components/Celebration';
import { SkillRadar } from '@/components/SkillRadar';
import { DomainBadge, TierBadge } from '@/components/tier';
import { Button, Card, ProgressBar, Screen, Text } from '@/components/ui';
import { track } from '@/lib/analytics';
import { haptic } from '@/lib/feedback';
import { play } from '@/lib/sound';
import { useReduceMotion } from '@/lib/motion';
import { useTierShare } from '@/features/share/useTierShare';
import { useT } from '@/i18n';
import { domainLabel, tierLabel } from '@/i18n/labels';
import { useEntitlements } from '@/state/entitlements';
import { useSession } from '@/state/session';
import { spacing, tierColors, useTheme } from '@/theme';

const SUSPENSE_MS = 2200;
const INITIAL = initialRatings();

export default function Reveal() {
  const reduce = useReduceMotion();
  const t = useT();
  const { domain: domainColor } = useTheme();
  const finished = useSession((s) => s.finished);
  const isPro = useEntitlements((s) => s.isPro);
  const [revealed, setRevealed] = useState(false);
  const tierShare = useTierShare(finished?.result.ratings ?? INITIAL);

  useEffect(() => {
    const timer = setTimeout(
      () => {
        setRevealed(true);
        track('placement_completed');
        haptic.success();
        play('rankup');
      },
      reduce ? 400 : SUSPENSE_MS,
    );
    return () => clearTimeout(timer);
  }, [reduce]);

  if (!finished) return <Redirect href="/" />;
  const ratings = finished.result.ratings;
  const info = tierInfo(overallRating(ratings));
  const sorted = DOMAINS.slice().sort((a, b) => ratings[b].rating - ratings[a].rating);
  const strongest = sorted[0] as Domain;
  const weakest = sorted[sorted.length - 1] as Domain;
  const c = tierColors[info.tier];

  const next = () => {
    useSession.getState().clearFinished();
    // The onboarding stack was swapped for the tabs when placement finished: replace, don't dismiss.
    if (isPro) router.replace('/');
    else router.replace({ pathname: '/paywall', params: { from: 'placement' } });
  };

  if (!revealed) {
    return (
      <Screen>
        <View style={styles.suspense}>
          <Text variant="heading" align="center">
            {t('reveal.calculating')}
          </Text>
          <View style={styles.bars}>
            {DOMAINS.map((d, i) => (
              <Animated.View key={d} entering={reduce ? undefined : FadeIn.delay(i * 280)} style={styles.barRow}>
                <DomainBadge domain={d} size={32} />
                <View style={styles.flex}>
                  <ProgressBar value={(ratings[d].rating - 700) / 1700} color={domainColor[d]} />
                </View>
              </Animated.View>
            ))}
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      scroll
      edges={['top', 'left', 'right', 'bottom']}
      footer={
        <View style={styles.footer}>
          <Button label={t('reveal.startClimbing')} size="lg" iconRight="arrowRight" fullWidth onPress={next} testID="reveal-continue" />
          <Button label={t('reveal.shareTier')} variant="ghost" icon="share" onPress={() => void tierShare.share()} />
        </View>
      }
    >
      {tierShare.card}
      <View style={styles.hero}>
        <Celebration colors={[c.highlight, c.base, '#FFFFFF']} reduceMotion={reduce} top={60} />
        <Text variant="label" tone="muted" align="center">
          {t('reveal.placed')}
        </Text>
        <Animated.View entering={reduce ? undefined : ZoomIn.springify().damping(11)}>
          <TierBadge info={info} size={168} showProvisional={false} />
        </Animated.View>
        <Animated.View entering={reduce ? undefined : FadeInUp.delay(250)}>
          <Text variant="hero" align="center">
            {tierLabel(t, info)}
          </Text>
          <Text tone="muted" align="center">
            {t('reveal.settles')}
          </Text>
        </Animated.View>
      </View>

      <Card style={styles.radarCard}>
        <SkillRadar ratings={ratings} />
      </Card>

      <View style={styles.insights}>
        <Card style={styles.insight}>
          <Text variant="caption" tone="faint" weight="semibold">
            {t('reveal.strongest')}
          </Text>
          <View style={styles.insightRow}>
            <DomainBadge domain={strongest} size={28} />
            <Text weight="semibold">{domainLabel(t, strongest)}</Text>
          </View>
          <Text variant="caption" tone="muted">
            {tierLabel(t, tierInfo(ratings[strongest]))}
          </Text>
        </Card>
        <Card style={styles.insight}>
          <Text variant="caption" tone="faint" weight="semibold">
            {t('reveal.room')}
          </Text>
          <View style={styles.insightRow}>
            <DomainBadge domain={weakest} size={28} />
            <Text weight="semibold">{domainLabel(t, weakest)}</Text>
          </View>
          <Text variant="caption" tone="muted">
            {tierLabel(t, tierInfo(ratings[weakest]))}
          </Text>
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  suspense: { flex: 1, justifyContent: 'center', gap: spacing.xxl },
  bars: { gap: spacing.md },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  hero: { alignItems: 'center', gap: spacing.md, paddingTop: spacing.xl, paddingBottom: spacing.lg },
  radarCard: { alignItems: 'center' },
  insights: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  insight: { flex: 1, gap: spacing.xs },
  insightRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  footer: { gap: spacing.xs },
});

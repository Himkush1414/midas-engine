import { DOMAINS, DOMAIN_LABELS, overallRating, tierInfo, type Domain } from '@mindtier/core';
import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { Celebration } from '@/components/Celebration';
import { SkillRadar } from '@/components/SkillRadar';
import { DomainBadge, TierBadge } from '@/components/tier';
import { Button, Card, ProgressBar, Screen, Text } from '@/components/ui';
import { haptic } from '@/lib/feedback';
import { useReduceMotion } from '@/lib/motion';
import { shareText, tierShareText } from '@/lib/share';
import { useEntitlements } from '@/state/entitlements';
import { useSession } from '@/state/session';
import { spacing, tierColors, useTheme } from '@/theme';

const SUSPENSE_MS = 2200;

export default function Reveal() {
  const reduce = useReduceMotion();
  const { domain: domainColor } = useTheme();
  const finished = useSession((s) => s.finished);
  const isPro = useEntitlements((s) => s.isPro);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const t = setTimeout(
      () => {
        setRevealed(true);
        haptic.success();
      },
      reduce ? 400 : SUSPENSE_MS,
    );
    return () => clearTimeout(t);
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
            Calculating your tier…
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
          <Button label="Start climbing" size="lg" iconRight="arrowRight" fullWidth onPress={next} testID="reveal-continue" />
          <Button label="Share my tier" variant="ghost" icon="share" onPress={() => void shareText(tierShareText(ratings))} />
        </View>
      }
    >
      <View style={styles.hero}>
        <Celebration colors={[c.highlight, c.base, '#FFFFFF']} reduceMotion={reduce} top={60} />
        <Text variant="label" tone="muted" align="center">
          YOU PLACED
        </Text>
        <Animated.View entering={reduce ? undefined : ZoomIn.springify().damping(11)}>
          <TierBadge info={info} size={168} showProvisional={false} />
        </Animated.View>
        <Animated.View entering={reduce ? undefined : FadeInUp.delay(250)}>
          <Text variant="hero" align="center">
            {info.label}
          </Text>
          <Text tone="muted" align="center">
            Placement ratings settle over your next few sessions.
          </Text>
        </Animated.View>
      </View>

      <Card style={styles.radarCard}>
        <SkillRadar ratings={ratings} />
      </Card>

      <View style={styles.insights}>
        <Card style={styles.insight}>
          <Text variant="caption" tone="faint" weight="semibold">
            STRONGEST
          </Text>
          <View style={styles.insightRow}>
            <DomainBadge domain={strongest} size={28} />
            <Text weight="semibold">{DOMAIN_LABELS[strongest]}</Text>
          </View>
          <Text variant="caption" tone="muted">
            {tierInfo(ratings[strongest]).label}
          </Text>
        </Card>
        <Card style={styles.insight}>
          <Text variant="caption" tone="faint" weight="semibold">
            MOST ROOM TO CLIMB
          </Text>
          <View style={styles.insightRow}>
            <DomainBadge domain={weakest} size={28} />
            <Text weight="semibold">{DOMAIN_LABELS[weakest]}</Text>
          </View>
          <Text variant="caption" tone="muted">
            {tierInfo(ratings[weakest]).label}
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

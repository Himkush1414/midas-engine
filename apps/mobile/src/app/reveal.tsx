import { DOMAINS, initialRatings, overallRating, tierInfo, type Domain } from '@mindtier/core';
import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { Celebration } from '@/components/Celebration';
import { SkillRadar } from '@/components/SkillRadar';
import { TierBadge } from '@/components/tier';
import { Button, Enter, fitDisplaySize, MAX_CONTENT_WIDTH, ProgressBar, Screen, Text } from '@/components/ui';
import { track } from '@/lib/analytics';
import { haptic } from '@/lib/feedback';
import { play } from '@/lib/sound';
import { useReduceMotion } from '@/lib/motion';
import { useTierShare } from '@/features/share/useTierShare';
import { useT } from '@/i18n';
import { domainLabel, tierLabel, tierParts } from '@/i18n/labels';
import { useEntitlements } from '@/state/entitlements';
import { useSession } from '@/state/session';
import { radii, SLANT_DEG, spacing, springs, tierColors, type, useTheme } from '@/theme';

const SUSPENSE_MS = 2200;
const INITIAL = initialRatings();

export default function Reveal() {
  const reduce = useReduceMotion();
  const t = useT();
  const { colors, domain: domainColor } = useTheme();
  const { width } = useWindowDimensions();
  const finished = useSession((s) => s.finished);
  const isPro = useEntitlements((s) => s.isPro);
  const [revealed, setRevealed] = useState(false);
  const tierShare = useTierShare(finished?.result.ratings ?? INITIAL);

  useEffect(() => {
    const timer = setTimeout(
      () => {
        setRevealed(true);
        track('placement_completed');
        // Impact, then settle: a heavy hit as the badge slams in, success as it lands.
        haptic.heavy();
        play('rankup');
        setTimeout(() => haptic.success(), 450);
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

  const { name, division } = tierParts(t, info);
  const column = Math.min(width, MAX_CONTENT_WIDTH) - spacing.gutter * 2;
  const nameSize = fitDisplaySize(division ? `${name} ${division}` : name, column, type.mega[0], 48);

  if (!revealed) {
    return (
      <Screen>
        <View style={styles.suspense}>
          <Text variant="micro" tone="muted">
            {t('reveal.calculating')}
          </Text>
          <View style={styles.bars}>
            {DOMAINS.map((d, i) => (
              <Animated.View key={d} entering={reduce ? undefined : FadeIn.delay(i * 280)} style={styles.barRow}>
                <Text variant="heading" style={[styles.barLabel, { color: domainColor[d] }]} numberOfLines={1}>
                  {domainLabel(t, d)}
                </Text>
                <ProgressBar value={(ratings[d].rating - 700) / 1700} color={domainColor[d]} segments={8} height={14} />
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
        <Celebration colors={[c.highlight, c.base, '#FFFFFF']} reduceMotion={reduce} top={80} />
        <Text variant="micro" tone="muted">
          {t('reveal.placed')}
        </Text>
        <Animated.View
          entering={reduce ? undefined : ZoomIn.springify().damping(springs.slam.damping).stiffness(springs.slam.stiffness)}
          style={styles.badge}
        >
          <View style={[styles.glow, { boxShadow: `0 0 80px 18px ${c.base}70` }]} />
          <TierBadge info={info} size={188} showProvisional={false} shine />
        </Animated.View>
        <Enter index={2}>
          <Text variant="mega" numberOfLines={1} style={{ fontSize: nameSize, lineHeight: nameSize * 0.92, color: c.base }}>
            {name}
            {division ? <Text variant="mega" style={{ fontSize: nameSize, lineHeight: nameSize * 0.92 }}>{` ${division}`}</Text> : null}
          </Text>
          <Text tone="muted">{t('reveal.settles')}</Text>
        </Enter>
      </View>

      <Enter index={4}>
        <View style={[styles.radar, { backgroundColor: colors.surface }]}>
          <SkillRadar ratings={ratings} color={c.base} />
        </View>
      </Enter>

      <View style={styles.insights}>
        {[
          { kicker: t('reveal.strongest'), d: strongest },
          { kicker: t('reveal.room'), d: weakest },
        ].map(({ kicker, d }, i) => (
          <Enter key={kicker} index={5 + i} style={styles.flex}>
            <View style={[styles.insight, { backgroundColor: colors.surface }]}>
              <View style={[styles.tab, { backgroundColor: domainColor[d] }]} />
              <Text variant="micro" tone="muted" numberOfLines={2}>
                {kicker}
              </Text>
              <Text variant="heading" numberOfLines={1} style={{ color: domainColor[d] }}>
                {domainLabel(t, d)}
              </Text>
              <Text variant="caption" tone="muted">
                {tierLabel(t, tierInfo(ratings[d]))}
              </Text>
            </View>
          </Enter>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  suspense: { flex: 1, justifyContent: 'center', gap: spacing.xl },
  bars: { gap: spacing.md },
  barRow: { gap: spacing.xs },
  barLabel: { fontSize: 22, lineHeight: 22 },
  hero: { gap: spacing.md, paddingTop: spacing.lg, paddingBottom: spacing.xl },
  badge: { alignSelf: 'center', width: 188, height: 188, alignItems: 'center', justifyContent: 'center', marginVertical: spacing.md },
  glow: { position: 'absolute', width: 110, height: 110, borderRadius: 110 },
  radar: { borderRadius: radii.md, paddingVertical: spacing.lg, paddingHorizontal: spacing.md },
  insights: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  insight: { gap: spacing.xs, padding: spacing.lg, borderRadius: radii.md, overflow: 'hidden', flexGrow: 1 },
  tab: { width: 22, height: 8, borderRadius: 1, transform: [{ skewX: `${SLANT_DEG}deg` }], marginBottom: spacing.xs },
  footer: { gap: spacing.xs },
});

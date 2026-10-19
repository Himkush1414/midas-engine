import { placementPlan, TIERS } from '@mindtier/core';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { TierBadge } from '@/components/tier';
import { Button, Enter, fitDisplaySize, MAX_CONTENT_WIDTH, Screen, Text } from '@/components/ui';
import { track } from '@/lib/analytics';
import { useT } from '@/i18n';
import { links } from '@/lib/links';
import { useReduceMotion } from '@/lib/motion';
import { useProgress } from '@/state/progress';
import { useSession } from '@/state/session';
import { SLANT_DEG, spacing, springs, useTheme } from '@/theme';

/** The whole ladder, Iron → Grandmaster, climbing left to right. */
const LADDER = TIERS.map((tier) => ({ tier, division: null, label: tier, provisional: false }));

function Ladder({ width, height }: { width: number; height: number }) {
  const reduce = useReduceMotion();
  const last = LADDER.length - 1;
  return (
    <View style={{ height }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {LADDER.map((info, i) => {
        const size = (40 + (i / last) * 46) * Math.min(1, height / 210);
        const left = (i / last) * (width - size);
        const bottom = (i / last) * (height - size);
        return (
          <Animated.View
            key={info.tier}
            entering={reduce ? FadeIn.duration(120) : ZoomIn.delay(120 + i * 70).springify().damping(springs.slam.damping + 4).stiffness(springs.slam.stiffness * 1.5)}
            style={[styles.rung, { left, bottom }]}
          >
            <TierBadge info={info} size={size} shine={i === last} />
          </Animated.View>
        );
      })}
    </View>
  );
}

export default function Welcome() {
  const { colors } = useTheme();
  const t = useT();
  const { width, height } = useWindowDimensions();
  const userSeed = useProgress((s) => s.userSeed);
  const start = useSession((s) => s.start);
  const column = Math.min(width, MAX_CONTENT_WIDTH) - spacing.gutter * 2;
  const title = t('welcome.title');
  const longest = title.split(/\s+/).reduce((a, b) => (b.length > a.length ? b : a), '');
  // Short phones get a shorter ladder and headline, so everything fits above the pinned button.
  const ladderHeight = Math.max(110, Math.min(210, height * 0.24));
  const titleSize = Math.min(fitDisplaySize(longest, column, 76, 36), Math.max(36, height * 0.075));

  const begin = () => {
    track('onboarding_started');
    start(placementPlan(userSeed));
    router.push('/session');
  };

  return (
    <Screen
      scroll
      contentStyle={styles.content}
      edges={['top', 'left', 'right', 'bottom']}
      footer={
        <View style={styles.footer}>
          <Button label={t('welcome.cta')} size="lg" iconRight="arrowRight" onPress={begin} fullWidth testID="welcome-start" />
          <Text variant="caption" tone="faint" align="center">
            {t('welcome.disclaimer')}{' '}
            <Text variant="caption" tone="primary" accessibilityRole="link" onPress={() => WebBrowser.openBrowserAsync(links.terms)}>
              {t('welcome.terms')}
            </Text>{' '}
            {t('welcome.and')}{' '}
            <Text variant="caption" tone="primary" accessibilityRole="link" onPress={() => WebBrowser.openBrowserAsync(links.privacy)}>
              {t('welcome.privacy')}
            </Text>
            .
          </Text>
        </View>
      }
    >
      <View style={styles.hero}>
        <Text variant="micro" tone="muted">
          Mindtier
        </Text>
        <Ladder width={column} height={ladderHeight} />
        <Enter index={3} style={styles.copy}>
          <Text variant="mega" accessibilityRole="header" style={{ fontSize: titleSize, lineHeight: titleSize * 0.9 }}>
            {title}
          </Text>
          <Text variant="subheading" tone="muted" weight="regular">
            {t('welcome.body')}
          </Text>
        </Enter>
        <Enter index={4} style={styles.facts}>
          {[t('welcome.factTime'), t('welcome.factSignup'), t('welcome.factAds')].map((f) => (
            <View key={f} style={styles.fact}>
              <View style={[styles.tick, { backgroundColor: colors.primaryText }]} />
              <Text variant="micro" tone="muted">
                {f}
              </Text>
            </View>
          ))}
        </Enter>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, paddingBottom: spacing.md },
  hero: { flex: 1, justifyContent: 'center', gap: spacing.lg, paddingTop: spacing.md },
  rung: { position: 'absolute' },
  copy: { gap: spacing.md },
  facts: { flexDirection: 'row', flexWrap: 'wrap', columnGap: spacing.lg, rowGap: spacing.xs },
  fact: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  tick: { width: 10, height: 6, borderRadius: 1, transform: [{ skewX: `${SLANT_DEG}deg` }] },
  footer: { gap: spacing.md },
});

import { placementPlan } from '@mindtier/core';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { TierBadge } from '@/components/tier';
import { Button, Screen, Text } from '@/components/ui';
import { track } from '@/lib/analytics';
import { links } from '@/lib/links';
import { useReduceMotion } from '@/lib/motion';
import { useProgress } from '@/state/progress';
import { useSession } from '@/state/session';
import { spacing, useTheme } from '@/theme';

const PREVIEW = (['bronze', 'gold', 'diamond'] as const).map((tier, i) => ({
  tier,
  division: (i === 1 ? 2 : 3) as 2 | 3,
  label: tier,
  provisional: false,
}));

export default function Welcome() {
  const { colors } = useTheme();
  const reduce = useReduceMotion();
  const userSeed = useProgress((s) => s.userSeed);
  const start = useSession((s) => s.start);

  const begin = () => {
    track('onboarding_started');
    start(placementPlan(userSeed));
    router.push('/session');
  };

  return (
    <Screen
      edges={['top', 'left', 'right', 'bottom']}
      footer={
        <View style={styles.footer}>
          <Button label="Find my tier" size="lg" iconRight="arrowRight" onPress={begin} fullWidth testID="welcome-start" />
          <Text variant="caption" tone="faint" align="center">
            Mindtier is a game. Ranks compare your skill at these puzzles with other players — they are not an IQ or
            medical assessment. By continuing you agree to the{' '}
            <Text variant="caption" tone="primary" onPress={() => WebBrowser.openBrowserAsync(links.terms)}>
              Terms
            </Text>{' '}
            and{' '}
            <Text variant="caption" tone="primary" onPress={() => WebBrowser.openBrowserAsync(links.privacy)}>
              Privacy Policy
            </Text>
            .
          </Text>
        </View>
      }
    >
      <View style={styles.hero}>
        <Animated.View entering={reduce ? undefined : FadeInUp.duration(500)} style={styles.badges}>
          {PREVIEW.map((p, i) => (
            <View key={p.tier} style={{ transform: [{ translateY: i === 1 ? -18 : 0 }], opacity: i === 1 ? 1 : 0.75 }}>
              <TierBadge info={p} size={i === 1 ? 128 : 92} />
            </View>
          ))}
        </Animated.View>
        <Animated.View entering={reduce ? undefined : FadeInDown.delay(150).duration(500)} style={styles.copy}>
          <Text variant="hero" align="center">
            What tier is your mind?
          </Text>
          <Text variant="subheading" tone="muted" align="center" weight="regular">
            Play 5 quick placement games — Memory, Focus, Speed, Logic and Math — to get your starting rank. Then
            climb all the way to Grandmaster.
          </Text>
        </Animated.View>
        <View style={styles.facts}>
          {['About 4 minutes', 'No sign-up needed', 'No ads, ever'].map((f) => (
            <View key={f} style={[styles.fact, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text variant="caption" tone="muted" weight="semibold">
                {f}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { flex: 1, justifyContent: 'center', gap: spacing.xl },
  badges: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', gap: spacing.sm },
  copy: { gap: spacing.md },
  facts: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.sm },
  fact: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: 999, borderWidth: 1 },
  footer: { gap: spacing.md },
});

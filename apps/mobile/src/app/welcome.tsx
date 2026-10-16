import { placementPlan } from '@mindtier/core';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { TierBadge } from '@/components/tier';
import { Button, Screen, Text } from '@/components/ui';
import { track } from '@/lib/analytics';
import { useT } from '@/i18n';
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
  const t = useT();
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
          <Button label={t('welcome.cta')} size="lg" iconRight="arrowRight" onPress={begin} fullWidth testID="welcome-start" />
          <Text variant="caption" tone="faint" align="center">
            {t('welcome.disclaimer')}{' '}
            <Text variant="caption" tone="primary" onPress={() => WebBrowser.openBrowserAsync(links.terms)}>
              {t('welcome.terms')}
            </Text>{' '}
            {t('welcome.and')}{' '}
            <Text variant="caption" tone="primary" onPress={() => WebBrowser.openBrowserAsync(links.privacy)}>
              {t('welcome.privacy')}
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
            {t('welcome.title')}
          </Text>
          <Text variant="subheading" tone="muted" align="center" weight="regular">
            {t('welcome.body')}
          </Text>
        </Animated.View>
        <View style={styles.facts}>
          {[t('welcome.factTime'), t('welcome.factSignup'), t('welcome.factAds')].map((f) => (
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

import { canStartRanked, currentStreak, rankedRemaining, utcDayKey } from '@mindtier/core';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Icon } from '@/components/icons/Icon';
import { Button, Card, PressableScale, Screen, Text } from '@/components/ui';
import { DomainList } from '@/features/home/DomainList';
import { RankHero } from '@/features/home/RankHero';
import { startDaily, startFocus, startRanked } from '@/features/session/start';
import { useEntitlements } from '@/state/entitlements';
import { useProgress } from '@/state/progress';
import { spacing, useTheme } from '@/theme';

export default function Home() {
  const { colors } = useTheme();
  const ratings = useProgress((s) => s.ratings);
  const today = utcDayKey(new Date());
  const usageDay = useProgress((s) => s.usageDay);
  const usageState = useProgress((s) => s.usage);
  const streakState = useProgress((s) => s.streak);
  const dailyDone = useProgress((s) => Boolean(s.daily[today]));
  // Select raw state and derive here: selectors must not return fresh objects.
  const usage = usageDay === today ? usageState : { rankedSessions: 0, duelsCreated: 0 };
  const streak = currentStreak(streakState, today);
  const isPro = useEntitlements((s) => s.isPro);

  const canRank = canStartRanked(isPro, usage);
  const remaining = rankedRemaining(isPro, usage);

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text variant="title">Climb</Text>
        <View style={styles.headerRight}>
          <View
            style={[styles.chip, { backgroundColor: colors.surface, borderColor: colors.border }]}
            accessible
            accessibilityLabel={`${streak.current} day streak, ${streak.shields} shields`}
          >
            <Icon name="flame" size={18} color={streak.current > 0 ? colors.warning : colors.textFaint} />
            <Text weight="semibold" tabular>
              {streak.current}
            </Text>
            {streak.shields > 0 ? (
              <>
                <Icon name="shield" size={16} color={colors.accent} />
                <Text variant="caption" tone="muted" tabular>
                  {streak.shields}
                </Text>
              </>
            ) : null}
          </View>
          <PressableScale onPress={() => router.push('/settings')} accessibilityLabel="Settings" style={styles.iconButton}>
            <Icon name="settings" size={24} color={colors.textMuted} />
          </PressableScale>
        </View>
      </View>

      <View style={styles.stack}>
        <RankHero ratings={ratings} />

        <Card raised style={styles.play}>
          <View style={styles.playText}>
            <Text variant="heading">Ranked session</Text>
            <Text tone="muted">3 games picked for you · about 4 minutes</Text>
          </View>
          {canRank ? (
            <>
              <Button label="Play ranked" icon="play" size="lg" fullWidth onPress={startRanked} testID="home-ranked" />
              {remaining !== null ? (
                <Text variant="caption" tone="faint" align="center">
                  {remaining} free ranked {remaining === 1 ? 'session' : 'sessions'} left today
                </Text>
              ) : null}
            </>
          ) : (
            <>
              <Text tone="muted">You’ve played today’s free ranked session. It refreshes at 00:00 UTC.</Text>
              <Button label="Keep climbing with Pro" variant="secondary" icon="sparkle" fullWidth onPress={() => router.push('/paywall')} />
            </>
          )}
        </Card>

        <Card onPress={dailyDone ? () => router.push('/daily') : startDaily} accessibilityLabel="Daily Challenge">
          <View style={styles.rowCard}>
            <View style={[styles.cardIcon, { backgroundColor: colors.surfaceRaised }]}>
              <Icon name="daily" size={24} color={colors.spark} />
            </View>
            <View style={styles.flex}>
              <Text weight="semibold">Daily Challenge</Text>
              <Text variant="caption" tone="muted">
                {dailyDone ? 'Done — see how you placed' : 'Same 3 puzzles for everyone today'}
              </Text>
            </View>
            <Icon name="chevronRight" size={20} color={colors.textFaint} />
          </View>
        </Card>

        <View style={styles.sectionHeader}>
          <Text variant="subheading" weight="semibold">
            Your domains
          </Text>
          {!isPro ? (
            <Text variant="caption" tone="faint">
              Focus training is Pro
            </Text>
          ) : null}
        </View>
        <DomainList ratings={ratings} onPress={(d) => (isPro ? startFocus(d) : router.push('/paywall'))} />

        <Button label="Zen practice" variant="ghost" icon="zen" onPress={() => router.push('/zen')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  chip: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, height: 36, borderRadius: 18, borderWidth: 1 },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  stack: { gap: spacing.lg },
  play: { gap: spacing.md },
  playText: { gap: 2 },
  rowCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  cardIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  sectionHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: spacing.sm },
});

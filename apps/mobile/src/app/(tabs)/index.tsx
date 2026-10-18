import { canStartRanked, currentStreak, rankedRemaining, utcDayKey } from '@mindtier/core';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Icon } from '@/components/icons/Icon';
import { Button, Card, Enter, PressableScale, RollingNumber, Screen, Text, Ticket, TICKET_GAP } from '@/components/ui';
import { DomainList } from '@/features/home/DomainList';
import { RankHero } from '@/features/home/RankHero';
import { LeagueCard } from '@/features/leagues/LeagueCard';
import { SeasonCard } from '@/features/seasons/SeasonCard';
import { startDaily, startFocus, startRanked } from '@/features/session/start';
import { useT } from '@/i18n';
import { useEntitlements } from '@/state/entitlements';
import { useProgress } from '@/state/progress';
import { radii, spacing, useTheme } from '@/theme';

export default function Home() {
  const { colors } = useTheme();
  const t = useT();
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
        <Text variant="heading">{t('tabs.climb')}</Text>
        <View style={styles.headerRight}>
          <View
            style={[styles.streak, { backgroundColor: colors.surfaceRaised }]}
            accessible
            accessibilityLabel={t('home.streakA11y', { days: streak.current, shields: streak.shields })}
          >
            <Icon name="flame" size={20} color={streak.current > 0 ? colors.danger : colors.textFaint} />
            <RollingNumber value={String(streak.current)} variant="subheading" display style={styles.streakCount} />
            {streak.shields > 0 ? (
              <>
                <Icon name="shield" size={16} color={colors.accent} />
                <Text variant="micro" tone="muted" tabular>
                  {streak.shields}
                </Text>
              </>
            ) : null}
          </View>
          <PressableScale onPress={() => router.push('/settings')} accessibilityLabel={t('home.settings')} style={styles.iconButton}>
            <Icon name="settings" size={24} color={colors.textMuted} />
          </PressableScale>
        </View>
      </View>

      <View style={styles.stack}>
        <RankHero ratings={ratings} />
        <SeasonCard announce />

        <Enter index={3}>
          <Card raised style={styles.play}>
            <View style={styles.playText}>
              <Text variant="micro" tone="primary">
                {t('home.rankedTitle')}
              </Text>
              <Text tone="muted">{t('home.rankedBody')}</Text>
            </View>
            {canRank ? (
              <>
                <Button label={t('home.playRanked')} icon="play" size="lg" fullWidth onPress={startRanked} testID="home-ranked" />
                {remaining !== null ? (
                  <Text variant="caption" tone="faint" align="center">
                    {t('home.freeLeft', { count: remaining })}
                  </Text>
                ) : null}
              </>
            ) : (
              <>
                <Text tone="muted">{t('home.limitReached')}</Text>
                <Button label={t('home.keepClimbing')} variant="secondary" icon="sparkle" fullWidth onPress={() => router.push('/paywall')} />
              </>
            )}
          </Card>
        </Enter>

        <Enter index={4} style={styles.tickets}>
          <Ticket
            kicker={today}
            title={t('home.dailyTitle')}
            detail={dailyDone ? t('home.dailyDone') : t('home.dailyTodo')}
            color={colors.spark}
            icon="daily"
            onPress={dailyDone ? () => router.push('/daily') : startDaily}
            columns={2}
            style={styles.ticket}
          />
          <LeagueCard style={styles.ticket} columns={2} />
        </Enter>

        <View style={styles.sectionHeader}>
          <Text variant="heading">{t('home.domainsTitle')}</Text>
          {!isPro ? (
            <Text variant="micro" tone="faint">
              {t('home.focusIsPro')}
            </Text>
          ) : null}
        </View>
        <DomainList ratings={ratings} onPress={(d) => (isPro ? startFocus(d) : router.push('/paywall'))} />

        <Button label={t('home.zen')} variant="ghost" icon="zen" onPress={() => router.push('/zen')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: spacing.md },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  streak: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, height: 40, borderRadius: radii.sm },
  streakCount: { fontSize: 24, lineHeight: 26 },
  iconButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  stack: { gap: spacing.xl },
  play: { gap: spacing.md, padding: spacing.lg },
  playText: { gap: spacing.xs },
  tickets: { flexDirection: 'row', gap: TICKET_GAP, alignItems: 'stretch' },
  ticket: { flex: 1 },
  sectionHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing.sm, marginBottom: -spacing.sm },
});

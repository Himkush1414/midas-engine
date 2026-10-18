import { overallRating, seasonDaysLeft, seasonOf } from '@mindtier/core';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Icon } from '@/components/icons/Icon';
import { Button, Card, Text, Ticket } from '@/components/ui';
import { useT } from '@/i18n';
import { tierLabel } from '@/i18n/labels';
import { useProgress } from '@/state/progress';
import { spacing, useTheme } from '@/theme';
import { seasonName, tierAt } from './season';

const openRecap = (season: number) => router.push({ pathname: '/season', params: { n: String(season) } });

/**
 * The current season at a glance. With `announce`, a season that just started
 * shows its intro instead, until the player dismisses it.
 */
export function SeasonCard({ announce = false }: { announce?: boolean }) {
  const { colors } = useTheme();
  const t = useT();
  const season = useProgress((s) => s.ratingsSeason);
  const stats = useProgress((s) => s.seasonStats);
  const ratings = useProgress((s) => s.ratings);
  const notice = useProgress((s) => s.seasonNotice);
  const previous = useProgress((s) => s.pastSeasons[0] ?? null);
  const now = new Date();

  if (announce && notice !== null) {
    const name = seasonName(t, notice);
    return (
      <Card raised style={[styles.notice, { borderLeftColor: colors.spark }]} testID="season-notice">
        <View style={styles.row}>
          <Icon name="trophy" size={28} color={colors.spark} />
          <Text variant="title" style={styles.flex}>
            {t('season.newTitle', { season: name })}
          </Text>
        </View>
        <Text tone="muted">{t('season.newBody')}</Text>
        {previous ? (
          <Button
            label={t('season.seeRecap', { season: seasonName(t, previous.season) })}
            icon="chart"
            variant="secondary"
            fullWidth
            onPress={() => {
              useProgress.getState().dismissSeasonNotice();
              openRecap(previous.season);
            }}
          />
        ) : null}
        <Button label={t('season.gotIt')} variant="ghost" fullWidth onPress={() => useProgress.getState().dismissSeasonNotice()} />
      </Card>
    );
  }

  const peak = tierAt(stats && stats.season === season ? stats.peakRating : overallRating(ratings).rating);
  const days = seasonDaysLeft(now);
  const timing = seasonOf(now) === 0 ? t('season.startsIn', { count: days }) : t('season.daysLeft', { count: days });
  return (
    <Ticket
      kicker={timing}
      title={seasonName(t, season)}
      detail={t('season.peak', { label: tierLabel(t, peak) })}
      color={colors.spark}
      icon="trophy"
      onPress={() => openRecap(season)}
      accessibilityLabel={t('season.open')}
      testID="season-card"
    />
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  notice: { gap: spacing.md, borderLeftWidth: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});

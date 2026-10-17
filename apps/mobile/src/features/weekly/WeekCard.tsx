import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Icon } from '@/components/icons/Icon';
import { Card, Text } from '@/components/ui';
import { useT, type TFunction } from '@/i18n';
import { domainLabel } from '@/i18n/labels';
import { useProgress } from '@/state/progress';
import { spacing, useTheme } from '@/theme';
import { weekRange, weeklyRecap, type WeeklyRecap } from './weekly';

/** One line about a week, e.g. "3 sessions · Memory +32". Shared with the recap notification. */
export function weekSummary(t: TFunction, recap: Pick<WeeklyRecap, 'sessions' | 'best'>): string {
  const parts = [t('week.summary', { count: recap.sessions })];
  if (recap.best) parts.push(t('week.bestShort', { domain: domainLabel(t, recap.best.domain), gain: recap.best.gain }));
  return parts.join(' · ');
}

/** Profile entry to the weekly recap. */
export function WeekCard() {
  const { colors } = useTheme();
  const t = useT();
  const activity = useProgress((s) => s.activity);
  const history = useProgress((s) => s.history);
  const daily = useProgress((s) => s.daily);
  const recap = weeklyRecap({ activity, history, daily }, weekRange(new Date()));

  return (
    <Card onPress={() => router.push('/week')} accessibilityLabel={t('week.open')}>
      <View style={styles.row}>
        <View style={[styles.icon, { backgroundColor: colors.surfaceRaised }]}>
          <Icon name="chart" size={24} color={colors.primary} />
        </View>
        <View style={styles.flex}>
          <Text weight="semibold">{t('week.thisWeek')}</Text>
          <Text variant="caption" tone="muted">
            {weekSummary(t, recap)}
          </Text>
        </View>
        <Icon name="chevronRight" size={20} color={colors.textFaint} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  icon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});

import { router } from 'expo-router';
import { Ticket } from '@/components/ui';
import { useT } from '@/i18n';
import { useProgress } from '@/state/progress';
import { useTheme } from '@/theme';
import { weekRange, weekSummary, weeklyRecap } from './weekly';

/** Profile entry to the weekly recap. */
export function WeekCard() {
  const { colors } = useTheme();
  const t = useT();
  const activity = useProgress((s) => s.activity);
  const history = useProgress((s) => s.history);
  const daily = useProgress((s) => s.daily);
  const recap = weeklyRecap({ activity, history, daily }, weekRange(new Date()));

  return (
    <Ticket
      kicker={t('week.title')}
      title={t('week.thisWeek')}
      detail={weekSummary(t, recap)}
      color={colors.primaryText}
      icon="chart"
      onPress={() => router.push('/week')}
      accessibilityLabel={t('week.open')}
      testID="week-card"
    />
  );
}

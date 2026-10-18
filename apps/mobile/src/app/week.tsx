import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { BackHeader } from '@/components/BackHeader';
import { Segmented } from '@/components/settings';
import { BestPlate, GainList, StatStrip } from '@/components/recap';
import { Screen, Text } from '@/components/ui';
import { weekRange, weeklyRecap, type WeekRange } from '@/features/weekly/weekly';
import { useLanguage, useT } from '@/i18n';
import { track } from '@/lib/analytics';
import { useProgress } from '@/state/progress';
import { radii, SLANT_DEG, spacing, useTheme } from '@/theme';

type Which = 'this' | 'last';

function formatDay(date: Date, locale: string, options: Intl.DateTimeFormatOptions): string {
  try {
    return new Intl.DateTimeFormat(locale, options).format(date);
  } catch {
    return date.toDateString();
  }
}

function rangeLabel(range: WeekRange, locale: string): string {
  const last = new Date(range.end.getFullYear(), range.end.getMonth(), range.end.getDate() - 1);
  const fmt = (d: Date) => formatDay(d, locale, { day: 'numeric', month: 'short' });
  return `${fmt(range.start)} – ${fmt(last)}`;
}

/** The player's week: this one so far, or the last full one. */
export default function WeekScreen() {
  const { colors } = useTheme();
  const t = useT();
  const language = useLanguage();
  const params = useLocalSearchParams<{ from?: string }>();
  const [which, setWhich] = useState<Which>('this');
  const activity = useProgress((s) => s.activity);
  const history = useProgress((s) => s.history);
  const daily = useProgress((s) => s.daily);

  useEffect(() => {
    track('weekly_recap_viewed', { from: params.from ?? 'app' });
  }, [params.from]);

  const range = weekRange(new Date(), which === 'this' ? 0 : -1);
  const recap = weeklyRecap({ activity, history, daily }, range);
  const days = Array.from({ length: 7 }, (_, i) => new Date(range.start.getFullYear(), range.start.getMonth(), range.start.getDate() + i));

  return (
    <Screen scroll>
      <BackHeader title={t('week.title')} />
      <View style={styles.stack}>
        <Segmented<Which>
          label={t('week.title')}
          value={which}
          onChange={setWhich}
          options={[
            { value: 'this', label: t('week.thisWeek') },
            { value: 'last', label: t('week.lastWeek') },
          ]}
        />
        <Text variant="micro" tone="muted">
          {rangeLabel(range, language)}
        </Text>

        <View style={[styles.days, { backgroundColor: colors.surface }]}>
          {days.map((d, i) => {
            const on = recap.played[i] ?? false;
            const name = formatDay(d, language, { weekday: 'long' });
            return (
              <View key={i} style={styles.day} accessible accessibilityLabel={t(on ? 'week.dayPlayed' : 'week.dayRest', { day: name })}>
                <View style={[styles.mark, { backgroundColor: on ? colors.primaryText : colors.surfaceSunken }]} />
                <Text variant="micro" tone={on ? 'default' : 'faint'}>
                  {formatDay(d, language, { weekday: 'narrow' })}
                </Text>
              </View>
            );
          })}
        </View>

        {recap.sessions === 0 ? (
          <Text tone="muted">{which === 'this' ? t('week.empty') : t('week.emptyLast')}</Text>
        ) : (
          <>
            <StatStrip
              items={[
                { label: t('week.sessions'), value: recap.sessions },
                { label: t('week.games'), value: recap.games },
                { label: t('week.activeDays'), value: `${recap.activeDays}/7` },
                { label: t('week.dailies'), value: recap.dailies },
              ]}
            />
            {recap.best ? <BestPlate kicker={t('week.best')} domain={recap.best.domain} gain={recap.best.gain} /> : null}
            {recap.gains.length > 0 ? <GainList title={t('week.changes')} gains={recap.gains} /> : null}
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing.lg },
  days: { flexDirection: 'row', justifyContent: 'space-between', borderRadius: radii.md, padding: spacing.lg, gap: spacing.xs },
  day: { flex: 1, alignItems: 'center', gap: spacing.sm },
  mark: { width: '80%', height: 28, borderRadius: radii.xs, transform: [{ skewX: `${SLANT_DEG}deg` }] },
});

import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { BackHeader } from '@/components/BackHeader';
import { Segmented } from '@/components/settings';
import { DomainBadge } from '@/components/tier';
import { Card, Screen, Text } from '@/components/ui';
import { weekRange, weeklyRecap, type WeekRange } from '@/features/weekly/weekly';
import { useLanguage, useT } from '@/i18n';
import { domainLabel } from '@/i18n/labels';
import { track } from '@/lib/analytics';
import { useProgress } from '@/state/progress';
import { radii, spacing, useTheme } from '@/theme';

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
        <Text variant="caption" tone="faint" weight="semibold" align="center">
          {rangeLabel(range, language)}
        </Text>

        <Card style={styles.days}>
          {days.map((d, i) => {
            const on = recap.played[i] ?? false;
            const name = formatDay(d, language, { weekday: 'long' });
            return (
              <View key={i} style={styles.day} accessible accessibilityLabel={t(on ? 'week.dayPlayed' : 'week.dayRest', { day: name })}>
                <View
                  style={[
                    styles.dot,
                    on ? { backgroundColor: colors.primary } : { borderWidth: 1.5, borderColor: colors.borderStrong },
                  ]}
                />
                <Text variant="caption" tone={on ? 'default' : 'faint'}>
                  {formatDay(d, language, { weekday: 'narrow' })}
                </Text>
              </View>
            );
          })}
        </Card>

        {recap.sessions === 0 ? (
          <Card>
            <Text tone="muted">{which === 'this' ? t('week.empty') : t('week.emptyLast')}</Text>
          </Card>
        ) : (
          <>
            <View style={styles.stats}>
              {[
                { label: t('week.sessions'), value: recap.sessions },
                { label: t('week.games'), value: recap.games },
                { label: t('week.activeDays'), value: `${recap.activeDays}/7` },
                { label: t('week.dailies'), value: recap.dailies },
              ].map((s) => (
                <Card key={s.label} style={styles.stat}>
                  <Text variant="heading" tabular>
                    {s.value}
                  </Text>
                  <Text variant="caption" tone="muted">
                    {s.label}
                  </Text>
                </Card>
              ))}
            </View>

            {recap.best ? (
              <Card style={styles.best}>
                <DomainBadge domain={recap.best.domain} size={36} />
                <View style={styles.flex}>
                  <Text variant="caption" tone="faint" weight="semibold">
                    {t('week.best')}
                  </Text>
                  <Text weight="semibold">{domainLabel(t, recap.best.domain)}</Text>
                </View>
                <Text tone="success" weight="semibold" tabular>
                  +{recap.best.gain}
                </Text>
              </Card>
            ) : null}

            {recap.gains.length > 0 ? (
              <>
                <Text variant="subheading" weight="semibold">
                  {t('week.changes')}
                </Text>
                <Card padded={false}>
                  {recap.gains.map((g, i) => (
                    <View key={g.domain} style={[styles.row, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
                      <DomainBadge domain={g.domain} size={28} />
                      <Text style={styles.flex}>{domainLabel(t, g.domain)}</Text>
                      <Text tabular weight="semibold" tone={g.gain > 0 ? 'success' : 'danger'}>
                        {g.gain > 0 ? '+' : '−'}
                        {Math.abs(g.gain)}
                      </Text>
                    </View>
                  ))}
                </Card>
              </>
            ) : null}
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  stack: { gap: spacing.lg },
  days: { flexDirection: 'row', justifyContent: 'space-between' },
  day: { alignItems: 'center', gap: spacing.xs, minWidth: 32 },
  dot: { width: 22, height: 22, borderRadius: radii.pill },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  stat: { flexGrow: 1, flexBasis: '45%', gap: 2 },
  best: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
});

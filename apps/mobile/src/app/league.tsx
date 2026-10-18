import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { BackHeader } from '@/components/BackHeader';
import { Button, Card, Screen, Text, Ticket } from '@/components/ui';
import { leagueDaysLeft, useLeague } from '@/features/leagues/league';
import { useLanguage, useT } from '@/i18n';
import { track } from '@/lib/analytics';
import { useAccount } from '@/state/account';
import { onColor, radii, SLANT_DEG, spacing, tierColors, useTheme } from '@/theme';

/** The weekly league: opt in, then this week's table and last week's finish. */
export default function LeagueScreen() {
  const { colors, scheme } = useTheme();
  const t = useT();
  const locale = useLanguage();
  const podium = (['gold', 'silver', 'bronze'] as const).map((m) => tierColors[m][scheme === 'dark' ? 'base' : 'deep']);
  const view = useLeague((s) => s.view);
  const loading = useLeague((s) => s.loading);
  const offline = useLeague((s) => s.offline);
  const displayName = useAccount((s) => s.displayName);

  useFocusEffect(
    useCallback(() => {
      void useLeague.getState().refresh();
    }, []),
  );

  const join = async () => {
    if (await useLeague.getState().setOptIn(true)) track('league_joined');
  };
  const leave = () =>
    Alert.alert(t('league.leaveTitle'), t('league.leaveBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('league.leave'),
        style: 'destructive',
        onPress: () => {
          void useLeague
            .getState()
            .setOptIn(false)
            .then((ok) => ok && track('league_left'));
        },
      },
    ]);

  return (
    <Screen scroll>
      <BackHeader title={t('league.title')} />
      <View style={styles.stack}>
        {!view ? (
          offline ? (
            <Card style={styles.gap}>
              <Text tone="muted">{t('league.offline')}</Text>
              <Button label={t('common.tryAgain')} variant="secondary" onPress={() => void useLeague.getState().refresh()} />
            </Card>
          ) : (
            <ActivityIndicator color={colors.primary} style={styles.spinner} />
          )
        ) : !view.optedIn ? (
          <View style={[styles.intro, { backgroundColor: colors.surfaceRaised }]}>
            <View style={styles.ladder} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              {[0.9, 0.7, 0.55, 0.42, 0.3].map((w, i) => (
                <View key={w} style={[styles.rung, { width: `${w * 100}%`, backgroundColor: i === 2 ? colors.primaryText : colors.surfaceSunken }]} />
              ))}
            </View>
            <Text variant="title">{t('league.introTitle')}</Text>
            <Text tone="muted">{t('league.introBody')}</Text>
            <Button label={t('league.joinButton')} icon="trophy" size="lg" fullWidth loading={loading} onPress={() => void join()} testID="league-join" />
          </View>
        ) : (
          <>
            <View style={styles.meta}>
              <View style={[styles.ends, { backgroundColor: colors.accent }]}>
                <Text variant="micro" weight="bold" style={[styles.unskew, { color: onColor(colors.accent) }]}>
                  {t('league.endsIn', { count: leagueDaysLeft(view.endsAt) })}
                </Text>
              </View>
              <Text variant="caption" tone="muted">
                {t('league.rule')}
              </Text>
            </View>

            {view.lastWeek ? (
              <Text variant="micro" tone="muted">
                {t('league.lastWeek', { place: view.lastWeek.place, size: view.lastWeek.size })}
              </Text>
            ) : null}

            {view.group ? (
              <View style={[styles.table, { backgroundColor: colors.surface }]} testID="league-table">
                {view.group.members.map((m, i) => (
                  <View
                    key={`${m.place}-${m.name}-${i}`}
                    accessible
                    accessibilityLabel={t('league.rowA11y', { place: m.place, name: m.me ? t('league.you') : m.name, points: m.points })}
                    style={[styles.row, m.me && { backgroundColor: colors.surfaceRaised }]}
                  >
                    {m.me ? <View style={[styles.meTab, { backgroundColor: colors.primaryText }]} /> : null}
                    <Text variant="subheading" display weight="semibold" tabular style={[styles.place, m.place <= 3 && { color: podium[m.place - 1] }]}>
                      {m.place}
                    </Text>
                    <View style={styles.flex}>
                      <Text weight={m.me ? 'bold' : 'regular'} numberOfLines={1}>
                        {m.me ? `${m.name} · ${t('league.you')}` : m.name}
                      </Text>
                      <Text variant="micro" tone="faint">
                        {t('league.days', { count: m.days })}
                      </Text>
                    </View>
                    <Text variant="subheading" display weight="semibold" tabular>
                      {t('common.points', { points: m.points.toLocaleString(locale) })}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Card>
                <Text tone="muted">{t('league.waitingBody')}</Text>
              </Card>
            )}

            {!displayName ? (
              <Ticket
                kicker={t('league.title')}
                title={t('league.nameHint')}
                color={colors.accent}
                icon="edit"
                onPress={() => router.push('/profile')}
              />
            ) : null}

            <Button label={t('league.leave')} variant="ghost" onPress={leave} testID="league-leave" />
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  stack: { gap: spacing.lg },
  gap: { gap: spacing.md },
  spinner: { marginTop: spacing.xl },
  intro: { borderRadius: radii.md, padding: spacing.lg, gap: spacing.md },
  ladder: { gap: 6, marginBottom: spacing.sm },
  rung: { height: 12, borderRadius: radii.xs, transform: [{ skewX: `${SLANT_DEG}deg` }] },
  meta: { gap: spacing.sm },
  ends: { alignSelf: 'flex-start', paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radii.xs, transform: [{ skewX: `${SLANT_DEG}deg` }] },
  unskew: { transform: [{ skewX: `${-SLANT_DEG}deg` }] },
  table: { borderRadius: radii.md, padding: spacing.sm, gap: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radii.sm, overflow: 'hidden' },
  meTab: { position: 'absolute', left: -3, top: 0, bottom: 0, width: 7, transform: [{ skewX: `${SLANT_DEG}deg` }] },
  place: { minWidth: 32 },
});

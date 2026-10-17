import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { BackHeader } from '@/components/BackHeader';
import { Button, Card, Screen, Text } from '@/components/ui';
import { leagueDaysLeft, useLeague } from '@/features/leagues/league';
import { useT } from '@/i18n';
import { track } from '@/lib/analytics';
import { useAccount } from '@/state/account';
import { spacing, useTheme } from '@/theme';

/** The weekly league: opt in, then this week's table and last week's finish. */
export default function LeagueScreen() {
  const { colors } = useTheme();
  const t = useT();
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
          <Card raised style={styles.gap}>
            <Text variant="heading">{t('league.introTitle')}</Text>
            <Text tone="muted">{t('league.introBody')}</Text>
            <Button label={t('league.joinButton')} icon="trophy" size="lg" fullWidth loading={loading} onPress={() => void join()} testID="league-join" />
          </Card>
        ) : (
          <>
            <Text variant="caption" tone="faint" weight="semibold" align="center">
              {t('league.endsIn', { count: leagueDaysLeft(view.endsAt) })} · {t('league.rule')}
            </Text>

            {view.lastWeek ? (
              <Card>
                <Text weight="semibold">{t('league.lastWeek', { place: view.lastWeek.place, size: view.lastWeek.size })}</Text>
              </Card>
            ) : null}

            {view.group ? (
              <Card padded={false} testID="league-table">
                {view.group.members.map((m, i) => (
                  <View
                    key={`${m.place}-${m.name}-${i}`}
                    accessible
                    accessibilityLabel={t('league.rowA11y', { place: m.place, name: m.me ? t('league.you') : m.name, points: m.points })}
                    style={[
                      styles.row,
                      i > 0 && { borderTopWidth: 1, borderTopColor: colors.border },
                      m.me && { backgroundColor: colors.surfaceRaised },
                    ]}
                  >
                    <Text tabular weight="semibold" tone={m.place <= 3 ? 'spark' : 'muted'} style={styles.place}>
                      {m.place}
                    </Text>
                    <View style={styles.flex}>
                      <Text weight={m.me ? 'semibold' : 'regular'} numberOfLines={1}>
                        {m.me ? `${m.name} · ${t('league.you')}` : m.name}
                      </Text>
                      <Text variant="caption" tone="faint">
                        {t('league.days', { count: m.days })}
                      </Text>
                    </View>
                    <Text tabular weight="semibold">
                      {t('common.points', { points: m.points })}
                    </Text>
                  </View>
                ))}
              </Card>
            ) : (
              <Card>
                <Text tone="muted">{t('league.waitingBody')}</Text>
              </Card>
            )}

            {!displayName ? (
              <Card onPress={() => router.push('/profile')} accessibilityLabel={t('league.nameHint')}>
                <Text variant="caption" tone="primary" weight="semibold">
                  {t('league.nameHint')}
                </Text>
              </Card>
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
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  place: { minWidth: 28, textAlign: 'center' },
});

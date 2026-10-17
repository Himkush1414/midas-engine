import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon } from '@/components/icons/Icon';
import { Card, Text } from '@/components/ui';
import { useT } from '@/i18n';
import { backendConfigured } from '@/lib/config';
import { spacing, useTheme } from '@/theme';
import { leagueDaysLeft, myRow, useLeague } from './league';

/** Home entry to the weekly league: an invitation, or where the player stands this week. */
export function LeagueCard() {
  const { colors } = useTheme();
  const t = useT();
  const view = useLeague((s) => s.view);

  useFocusEffect(
    useCallback(() => {
      void useLeague.getState().refresh();
    }, []),
  );

  // Leagues are online only: without a backend, or before the first answer, there is nothing to show.
  if (!backendConfigured || !view) return null;

  const me = myRow(view);
  const title = view.optedIn ? t('league.title') : t('league.join');
  const detail = !view.optedIn
    ? t('league.joinDetail')
    : me && view.group
      ? `${t('league.place', { place: me.place, size: view.group.size })} · ${t('league.endsIn', { count: leagueDaysLeft(view.endsAt) })}`
      : t('league.waiting');

  return (
    <Card onPress={() => router.push('/league')} accessibilityLabel={`${title}. ${detail}`} testID="league-card">
      <View style={styles.row}>
        <View style={[styles.icon, { backgroundColor: colors.surfaceRaised }]}>
          <Icon name="trophy" size={24} color={colors.accent} />
        </View>
        <View style={styles.flex}>
          <Text weight="semibold">{title}</Text>
          <Text variant="caption" tone="muted">
            {detail}
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

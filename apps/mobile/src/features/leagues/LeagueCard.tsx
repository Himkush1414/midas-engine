import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Ticket } from '@/components/ui';
import { useT } from '@/i18n';
import { backendConfigured } from '@/lib/config';
import { useTheme } from '@/theme';
import { leagueDaysLeft, myRow, useLeague } from './league';

/** Home entry to the weekly league: an invitation, or where the player stands this week. */
export function LeagueCard({ style, columns }: { style?: StyleProp<ViewStyle>; columns?: number }) {
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
    <Ticket
      kicker={t('league.title')}
      title={view.optedIn && me ? `#${me.place}` : title}
      detail={detail}
      color={colors.accent}
      icon="trophy"
      onPress={() => router.push('/league')}
      accessibilityLabel={`${title}. ${detail}`}
      testID="league-card"
      style={style}
      columns={columns}
    />
  );
}

import { DOMAIN_LABELS, dailyPlan, getGame, utcDayKey } from '@mindtier/core';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Icon } from '@/components/icons/Icon';
import { DomainBadge } from '@/components/tier';
import { Button, Card, Screen, Text } from '@/components/ui';
import { accuracyBar, dailyShareText, untilNextDaily } from '@/features/daily/dailyShare';
import { startDaily } from '@/features/session/start';
import { syncNow } from '@/features/sync/sync';
import { track } from '@/lib/analytics';
import { api, type DailyBoard } from '@/lib/api';
import { backendConfigured } from '@/lib/config';
import { shareText } from '@/lib/share';
import { useAccount } from '@/state/account';
import { useProgress } from '@/state/progress';
import { spacing, useTheme } from '@/theme';

export default function Daily() {
  const { colors } = useTheme();
  const today = utcDayKey(new Date());
  const plan = dailyPlan(today);
  const record = useProgress((s) => s.daily[today]);
  const displayName = useAccount((s) => s.displayName);
  const [board, setBoard] = useState<DailyBoard | null>(null);
  const [loading, setLoading] = useState(false);
  const [offline, setOffline] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!record || !backendConfigured) return;
      let cancelled = false;
      const day = utcDayKey(new Date());
      setLoading(true);
      (async () => {
        try {
          await syncNow();
          const next = await api.dailyBoard(day);
          if (!cancelled) {
            setBoard(next);
            setOffline(false);
          }
        } catch {
          if (!cancelled) setOffline(true);
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [record]),
  );

  const next = untilNextDaily(new Date());
  const share = () => {
    if (!record) return;
    track('share_tapped', { what: 'daily' });
    void shareText(dailyShareText(today, record.points, plan.games, record.accuracy, board?.me?.percentile));
  };

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text variant="title">Daily Challenge</Text>
        <Text tone="muted">Same three puzzles for everyone · resets at 00:00 UTC</Text>
      </View>

      <View style={styles.stack}>
        <Card raised style={styles.gap}>
          <Text variant="caption" tone="faint" weight="semibold">
            TODAY · {today}
          </Text>
          {plan.games.map((g, i) => {
            const def = getGame(g);
            return (
              <View key={g} style={styles.gameRow}>
                <DomainBadge domain={def.domain} size={36} />
                <View style={styles.flex}>
                  <Text weight="semibold">{def.name}</Text>
                  <Text variant="caption" tone="muted">
                    {DOMAIN_LABELS[def.domain]}
                  </Text>
                </View>
                {record ? (
                  <Text tabular tone="muted" accessibilityLabel={`${Math.round((record.accuracy[i] ?? 0) * 100)} percent`}>
                    {accuracyBar(record.accuracy[i] ?? 0)}
                  </Text>
                ) : null}
              </View>
            );
          })}
          {record ? (
            <>
              <Text variant="title" tabular align="center">
                {record.points.toLocaleString()} pts
              </Text>
              <Button label="Share result" icon="share" variant="secondary" fullWidth onPress={share} />
              <Text variant="caption" tone="faint" align="center">
                Next challenge in {next.hours}h {next.minutes}m
              </Text>
            </>
          ) : (
            <Button label="Play today’s challenge" icon="play" size="lg" fullWidth onPress={() => startDaily()} testID="daily-play" />
          )}
        </Card>

        {record ? (
          <Card style={styles.gap}>
            <View style={styles.boardHeader}>
              <Text variant="subheading" weight="semibold">
                Leaderboard
              </Text>
              {board?.me?.percentile ? (
                <Text tone="accent" weight="semibold">
                  Top {Math.max(1, 100 - board.me.percentile + 1)}%
                </Text>
              ) : null}
            </View>
            {!backendConfigured ? (
              <Text tone="muted">Leaderboards are available in the full release.</Text>
            ) : loading && !board ? (
              <ActivityIndicator color={colors.primaryText} />
            ) : offline && !board ? (
              <View style={styles.offline}>
                <Icon name="wifiOff" size={20} color={colors.textMuted} />
                <Text tone="muted" style={styles.flex}>
                  You’re offline. Your score is saved and will be ranked when you reconnect.
                </Text>
              </View>
            ) : board ? (
              <>
                {!displayName ? (
                  <Card onPress={() => router.push('/profile')} accessibilityLabel="Set a display name for the leaderboard">
                    <Text variant="caption" weight="semibold">
                      You appear as “Player”
                    </Text>
                    <Text variant="caption" tone="muted">
                      Tap to choose a name for leaderboards and duels.
                    </Text>
                  </Card>
                ) : null}
                <Text variant="caption" tone="muted">
                  {board.total.toLocaleString()} {board.total === 1 ? 'player' : 'players'} today
                  {board.me ? ` · you’re #${board.me.place}` : ''}
                </Text>
                {board.top.slice(0, 20).map((e) => (
                  <View key={`${e.place}-${e.name}`} style={[styles.boardRow, e.me && { backgroundColor: colors.surfaceRaised }]}>
                    <Text tabular tone="faint" style={styles.place}>
                      {e.place}
                    </Text>
                    <Text style={styles.flex} weight={e.me ? 'semibold' : 'regular'} numberOfLines={1}>
                      {e.me ? `${e.name} (you)` : e.name}
                    </Text>
                    <Text tabular weight="semibold">
                      {e.points.toLocaleString()}
                    </Text>
                  </View>
                ))}
              </>
            ) : null}
          </Card>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { paddingVertical: spacing.md, gap: 2 },
  stack: { gap: spacing.lg },
  gap: { gap: spacing.md },
  gameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  boardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  boardRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.sm, borderRadius: 10 },
  place: { width: 28 },
  offline: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
});

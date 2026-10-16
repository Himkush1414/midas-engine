import { DOMAIN_LABELS, duelPlan, getGame } from '@mindtier/core';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Icon } from '@/components/icons/Icon';
import { DomainBadge } from '@/components/tier';
import { Button, Card, PressableScale, Screen, Text } from '@/components/ui';
import { playDuel, shareDuel } from '@/features/duels/actions';
import { api, type DuelInfo } from '@/lib/api';
import { normaliseDuelCode, useDuels } from '@/state/duels';
import { useProgress } from '@/state/progress';
import { spacing, useTheme } from '@/theme';

export default function DuelScreen() {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ id: string }>();
  const id = normaliseDuelCode(params.id ?? '');
  const local = useDuels((s) => s.duels.find((d) => d.id === id));
  const placementDone = useProgress((s) => s.placementDone);
  const [info, setInfo] = useState<DuelInfo | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'missing' | 'offline'>('loading');

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    api
      .duel(id)
      .then((d) => {
        if (cancelled) return;
        setInfo(d);
        setState('ready');
        const me = d.entries.find((e) => e.isMe);
        const other = d.entries.find((e) => !e.isMe);
        useDuels.getState().upsert({
          id,
          expiresAt: d.expiresAt,
          ...(me ? { myPoints: me.points } : {}),
          opponent: other ? { name: other.name, points: other.points } : null,
        });
      })
      .catch((e: { status?: number }) => {
        if (!cancelled) setState(e?.status === 404 ? 'missing' : 'offline');
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  if (!id || state === 'missing') {
    return (
      <Screen>
        <View style={styles.center}>
          <Text variant="heading">Duel not found</Text>
          <Text tone="muted" align="center">
            Check the code and try again.
          </Text>
          <Button label="Back" variant="secondary" onPress={close} />
        </View>
      </Screen>
    );
  }

  const plan = duelPlan(id);
  const played = (local?.myPoints ?? null) !== null || Boolean(info?.entries.some((e) => e.isMe));
  const expired = info?.expired ?? false;
  const me = info?.entries.find((e) => e.isMe);
  const other = info?.entries.find((e) => !e.isMe);

  return (
    <Screen scroll edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.top}>
        <PressableScale onPress={close} accessibilityLabel="Back" style={styles.back}>
          <Icon name="back" size={24} color={colors.text} />
        </PressableScale>
        <Text variant="label" tone="faint" tabular>
          DUEL {id.toUpperCase()}
        </Text>
        <View style={styles.back} />
      </View>

      <View style={styles.stack}>
        <Text variant="title" align="center">
          {info ? (local?.role === 'creator' || info.entries.find((e) => e.isMe && e.isCreator) ? 'Your challenge' : `${info.creatorName} challenged you`) : 'Duel'}
        </Text>

        <Card style={styles.gap}>
          {plan.games.map((g) => {
            const def = getGame(g);
            return (
              <View key={g} style={styles.row}>
                <DomainBadge domain={def.domain} size={36} />
                <View style={styles.flex}>
                  <Text weight="semibold">{def.name}</Text>
                  <Text variant="caption" tone="muted">
                    {DOMAIN_LABELS[def.domain]}
                  </Text>
                </View>
              </View>
            );
          })}
        </Card>

        {state === 'loading' ? <ActivityIndicator color={colors.primaryText} /> : null}
        {state === 'offline' ? (
          <Text tone="muted" align="center">
            You’re offline — scores will appear when you reconnect.
          </Text>
        ) : null}

        {info && (me || other) ? (
          <Card style={styles.scores}>
            <View style={styles.score}>
              <Text variant="caption" tone="faint">
                YOU
              </Text>
              <Text variant="title" tabular>
                {me ? me.points.toLocaleString() : '—'}
              </Text>
            </View>
            <Text tone="faint">vs</Text>
            <View style={styles.score}>
              <Text variant="caption" tone="faint" numberOfLines={1}>
                {(other?.name ?? 'FRIEND').toUpperCase()}
              </Text>
              <Text variant="title" tabular>
                {other ? other.points.toLocaleString() : '—'}
              </Text>
            </View>
          </Card>
        ) : null}

        {!placementDone ? (
          <Text tone="muted" align="center">
            Finish your placement first, then come back to this duel.
          </Text>
        ) : expired ? (
          <Text tone="muted" align="center">
            This duel has expired.
          </Text>
        ) : !played ? (
          <Button label="Play duel" icon="play" size="lg" fullWidth onPress={() => playDuel(id)} testID="duel-play" />
        ) : null}

        <Button label="Share duel link" icon="share" variant="secondary" fullWidth onPress={() => shareDuel(id)} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 48 },
  back: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  stack: { gap: spacing.lg, paddingTop: spacing.md },
  gap: { gap: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  scores: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  score: { alignItems: 'center', flex: 1 },
});

import { DOMAIN_LABELS, getGame, type GameId, type GameMode } from '@mindtier/core';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { DomainBadge } from '@/components/tier';
import { Button, Card, Text } from '@/components/ui';
import { spacing, useTheme } from '@/theme';

const MODE_NOTE: Record<GameMode, string> = {
  placement: 'Placement match — sets your starting rank',
  ranked: 'Ranked — your rating will move',
  daily: 'Daily Challenge — same puzzles for everyone today',
  duel: 'Duel — your friend plays these exact puzzles',
  zen: 'Zen — untimed and unrated',
};

export interface GameIntroProps {
  gameId: GameId;
  mode: GameMode;
  position: number;
  total: number;
  reduceMotion: boolean;
  onStart(): void;
  onPractice(): void;
}

export function GameIntro({ gameId, mode, position, total, reduceMotion, onStart, onPractice }: GameIntroProps) {
  const def = getGame(gameId);
  const color = useTheme().domain[def.domain];
  return (
    <View style={styles.root}>
      <Animated.View entering={reduceMotion ? undefined : FadeInDown.duration(320)} style={styles.content}>
        <Text variant="label" tone="faint" align="center">
          Game {position} of {total}
        </Text>
        <View style={styles.badge}>
          <DomainBadge domain={def.domain} size={72} />
        </View>
        <Text variant="caption" align="center" style={{ color }} weight="semibold">
          {DOMAIN_LABELS[def.domain].toUpperCase()}
        </Text>
        <Text variant="hero" align="center">
          {def.name}
        </Text>
        <Card style={styles.rules}>
          <Text variant="body" align="center">
            {def.rules}
          </Text>
        </Card>
        <Text variant="caption" tone="muted" align="center">
          {MODE_NOTE[mode]}
        </Text>
      </Animated.View>
      <View style={styles.actions}>
        <Button label="Start" size="lg" icon="play" onPress={onStart} fullWidth testID="intro-start" />
        <Button label="Practice first (untimed)" variant="ghost" onPress={onPractice} fullWidth testID="intro-practice" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'space-between' },
  content: { gap: spacing.md, paddingTop: spacing.xxl },
  badge: { alignItems: 'center', marginTop: spacing.lg },
  rules: { marginTop: spacing.md },
  actions: { gap: spacing.sm, paddingBottom: spacing.lg },
});

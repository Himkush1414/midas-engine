import { gameSeed, getGame, type RunSummary } from '@mindtier/core';
import { Redirect, router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Icon } from '@/components/icons/Icon';
import { Button, PressableScale, Screen, Text } from '@/components/ui';
import { RunPlayer } from '@/features/play/RunPlayer';
import { Countdown } from '@/features/session/Countdown';
import { GameIntro } from '@/features/session/GameIntro';
import { track } from '@/lib/analytics';
import { useReduceMotion } from '@/lib/motion';
import { useSession } from '@/state/session';
import { spacing, useTheme } from '@/theme';

type Phase = 'intro' | 'practice' | 'countdown' | 'play' | 'between';

const PRACTICE_TRIALS = 3;

export default function SessionScreen() {
  const { colors } = useTheme();
  const reduceMotion = useReduceMotion();
  const active = useSession((s) => s.active);
  const recordRun = useSession((s) => s.recordRun);
  const finish = useSession((s) => s.finish);
  const abandon = useSession((s) => s.abandon);
  const [phase, setPhase] = useState<Phase>('intro');
  const [last, setLast] = useState<RunSummary | null>(null);
  const [practiceNonce, setPracticeNonce] = useState(0);

  const index = active?.runs.length ?? 0;
  const gameId = active?.plan.games[index];

  const onRunDone = useCallback(
    (summary: RunSummary) => {
      track('game_completed', { game: summary.gameId, mode: summary.mode, accuracy: Math.round(summary.accuracy * 10) / 10 });
      recordRun(summary);
      setLast(summary);
      setPhase('between');
    },
    [recordRun],
  );

  const onCountdownDone = useCallback(() => setPhase('play'), []);

  if (!active) return <Redirect href="/" />;

  const total = active.plan.games.length;
  const isLastGame = index >= total;

  const proceed = () => {
    if (index >= total) {
      const done = finish();
      if (!done) return router.back();
      router.replace(done.plan.mode === 'placement' ? '/reveal' : '/results');
      return;
    }
    setPhase('intro');
  };

  const quit = () => {
    Alert.alert('Leave this session?', 'Games you have finished in this session will not count.', [
      { text: 'Keep playing', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: () => {
          abandon();
          router.back();
        },
      },
    ]);
  };

  const domain = gameId ? getGame(gameId).domain : null;
  const rating = domain ? active.ratingsAtStart[domain].rating : undefined;

  return (
    <Screen edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.topBar}>
        <PressableScale onPress={quit} accessibilityLabel="Leave session" style={styles.close} testID="session-quit">
          <Icon name="close" size={24} color={colors.textMuted} />
        </PressableScale>
        <View style={styles.dots} accessibilityLabel={`Game ${Math.min(index + 1, total)} of ${total}`}>
          {active.plan.games.map((g, i) => (
            <View
              key={`${g}-${i}`}
              style={[styles.dot, { backgroundColor: i < index ? colors.primary : i === index ? colors.primaryText : colors.surfaceRaised }]}
            />
          ))}
        </View>
        <View style={styles.close} />
      </View>

      {phase === 'intro' && gameId ? (
        <GameIntro
          gameId={gameId}
          mode={active.plan.mode}
          position={index + 1}
          total={total}
          reduceMotion={reduceMotion}
          onStart={() => setPhase('countdown')}
          onPractice={() => {
            setPracticeNonce((n) => n + 1);
            setPhase('practice');
          }}
        />
      ) : null}

      {phase === 'practice' && gameId ? (
        <View style={styles.flex}>
          <Text variant="label" tone="accent" align="center">
            Practice round — doesn’t count
          </Text>
          <RunPlayer
            key={`practice-${practiceNonce}`}
            gameId={gameId}
            mode="zen"
            seed={`practice|${gameId}|${practiceNonce}`}
            {...(rating !== undefined ? { rating: rating - 150 } : {})}
            trialCount={PRACTICE_TRIALS}
            reduceMotion={reduceMotion}
            onDone={() => setPhase('intro')}
          />
        </View>
      ) : null}

      {phase === 'countdown' ? <Countdown reduceMotion={reduceMotion} onDone={onCountdownDone} /> : null}

      {phase === 'play' && gameId ? (
        <RunPlayer
          key={`${active.plan.seed}-${index}`}
          gameId={gameId}
          mode={active.plan.mode}
          seed={gameSeed(active.plan, index)}
          {...(rating !== undefined ? { rating } : {})}
          reduceMotion={reduceMotion}
          onDone={onRunDone}
        />
      ) : null}

      {phase === 'between' && last ? (
        <Animated.View entering={reduceMotion ? undefined : FadeIn} style={styles.between}>
          <Text variant="label" tone="faint" align="center">
            {getGame(last.gameId).name} complete
          </Text>
          <Text variant="hero" align="center" tabular>
            {Math.round(last.accuracy * 100)}%
          </Text>
          <Text tone="muted" align="center">
            accuracy · reached level {Math.max(last.peakLevel, 1)}
          </Text>
          <View style={styles.betweenAction}>
            <Button
              label={isLastGame ? 'See results' : 'Next game'}
              iconRight="arrowRight"
              size="lg"
              fullWidth
              onPress={proceed}
              testID="session-next"
            />
          </View>
        </Animated.View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: spacing.sm },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 48 },
  close: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  dots: { flexDirection: 'row', gap: spacing.sm },
  dot: { width: 28, height: 6, borderRadius: 3 },
  between: { flex: 1, justifyContent: 'center', gap: spacing.sm },
  betweenAction: { marginTop: spacing.xxl },
});

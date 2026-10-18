import { gameSeed, getGame, type RunSummary } from '@mindtier/core';
import { Redirect, router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Icon } from '@/components/icons/Icon';
import { Button, PressableScale, RollingNumber, Screen, Text } from '@/components/ui';
import { RunPlayer } from '@/features/play/RunPlayer';
import { Countdown } from '@/features/session/Countdown';
import { GameIntro } from '@/features/session/GameIntro';
import { useT } from '@/i18n';
import { track } from '@/lib/analytics';
import { useReduceMotion } from '@/lib/motion';
import { useSession } from '@/state/session';
import { SLANT_DEG, spacing, useTheme } from '@/theme';

type Phase = 'intro' | 'practice' | 'countdown' | 'play' | 'between';

const PRACTICE_TRIALS = 3;

export default function SessionScreen() {
  const { colors, domain: domainColor } = useTheme();
  const t = useT();
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
    Alert.alert(t('session.leaveTitle'), t('session.leaveBody'), [
      { text: t('session.keepPlaying'), style: 'cancel' },
      {
        text: t('session.leave'),
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
        <PressableScale onPress={quit} accessibilityLabel={t('session.leaveA11y')} style={styles.close} testID="session-quit">
          <Icon name="close" size={24} color={colors.textMuted} />
        </PressableScale>
        <View style={styles.dots} accessible accessibilityLabel={t('session.gameOf', { index: Math.min(index + 1, total), total })}>
          {active.plan.games.map((g, i) => (
            <View
              key={`${g}-${i}`}
              style={[
                styles.dot,
                {
                  backgroundColor: i < index ? colors.primary : i === index ? domainColor[getGame(g).domain] : colors.surfaceRaised,
                },
              ]}
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
            {t('session.practiceBanner')}
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
          <View style={[styles.betweenTab, { backgroundColor: domainColor[getGame(last.gameId).domain] }]} />
          <Text variant="micro" tone="muted">
            {t('session.complete', { game: getGame(last.gameId).name })}
          </Text>
          <View style={styles.score}>
            <RollingNumber value={String(Math.round(last.accuracy * 100))} variant="mega" style={styles.scoreNumber} />
            <Text variant="hero" tone="muted" style={styles.percent}>
              %
            </Text>
          </View>
          <Text variant="micro" tone="muted">
            {t('session.accuracy', { level: Math.max(last.peakLevel, 1) })}
          </Text>
          <View style={styles.betweenAction}>
            <Button
              label={isLastGame ? t('session.seeResults') : t('session.nextGame')}
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
  dots: { flex: 1, flexDirection: 'row', gap: 4, maxWidth: 240 },
  dot: { flex: 1, height: 8, borderRadius: 1, transform: [{ skewX: `${SLANT_DEG}deg` }] },
  between: { flex: 1, justifyContent: 'center', gap: spacing.sm },
  betweenTab: { width: 40, height: 10, borderRadius: 1, transform: [{ skewX: `${SLANT_DEG}deg` }], marginBottom: spacing.sm },
  score: { flexDirection: 'row', alignItems: 'flex-end' },
  scoreNumber: { fontSize: 168, lineHeight: 150 },
  percent: { marginBottom: spacing.md, marginLeft: spacing.xs },
  betweenAction: { marginTop: spacing.xxl },
});

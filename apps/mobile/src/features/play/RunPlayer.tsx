import { getGame, type GameId, type GameMode, type RunSummary } from '@mindtier/core';
import { useCallback, useEffect, useRef } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui';
import { useT } from '@/i18n';
import { registerQaAnswer } from '@/lib/devHooks';
import { haptic } from '@/lib/feedback';
import { play } from '@/lib/sound';
import { useSettings } from '@/state/settings';
import { spacing } from '@/theme';
import { FeedbackFlash } from './FeedbackFlash';
import { TimerBar } from './TimerBar';
import { useGameRun } from './useGameRun';
import { GameStage } from './views';

export interface RunPlayerProps {
  gameId: GameId;
  mode: GameMode;
  seed: string;
  rating?: number;
  trialCount?: number;
  reduceMotion: boolean;
  onDone(summary: RunSummary): void;
}

/** Feedback hold times: fast games keep momentum, slower games let errors register. */
function feedbackMs(kind: 'correct' | 'wrong' | 'partial', fast: boolean): number {
  if (fast) return kind === 'correct' ? 180 : 420;
  return kind === 'correct' ? 320 : 700;
}

const FAST_GAMES: ReadonlySet<GameId> = new Set(['flank', 'clash', 'snap', 'match', 'estimate', 'spot']);

export function RunPlayer({ gameId, mode, seed, rating, trialCount, reduceMotion, onDone }: RunPlayerProps) {
  const t = useT();
  const def = getGame(gameId);
  const shapeMode = useSettings((s) => s.shapeMode);
  const run = useGameRun<unknown, unknown>(def, {
    mode,
    seed,
    ...(rating !== undefined ? { rating } : {}),
    ...(trialCount !== undefined ? { trialCount } : {}),
  });
  const { feedback, advance, answer, restartTrial, done, summary } = run;
  const finished = useRef(false);

  // Hold feedback briefly, then move on.
  useEffect(() => {
    if (!feedback) return;
    if (feedback === 'correct') {
      haptic.correct();
      play('correct');
    } else {
      haptic.wrong();
      play('wrong');
    }
    const timer = setTimeout(advance, feedbackMs(feedback, FAST_GAMES.has(gameId)));
    return () => clearTimeout(timer);
  }, [feedback, advance, gameId]);

  useEffect(() => {
    if (done && !finished.current) {
      finished.current = true;
      onDone(summary());
    }
  }, [done, onDone, summary]);

  // Backgrounding mid-trial would make timings meaningless: replay the trial on return.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') restartTrial();
    });
    return () => sub.remove();
  }, [restartTrial]);

  // QA builds only: let end-to-end scripts answer the current trial correctly.
  const { trial, inputOpenedAt } = run;
  useEffect(() => {
    registerQaAnswer(
      trial !== null && inputOpenedAt !== null && !feedback
        ? () => {
            // Answer like a fast human: never quicker than the game's plausibility floor.
            const now = globalThis.performance?.now?.() ?? Date.now();
            if (now - inputOpenedAt >= def.minHumanRtMs + 80) answer(def.solve(trial));
          }
        : null,
    );
    return () => registerQaAnswer(null);
  }, [trial, inputOpenedAt, feedback, answer, def]);

  const onExpire = useCallback(() => {
    answer(null);
  }, [answer]);

  if (!run.trial) return null;

  return (
    <View style={styles.root}>
      <View style={styles.meta}>
        <View style={styles.count} accessible accessibilityLabel={t('play.round', { index: run.index + 1, total: run.total })}>
          <Text variant="heading" tabular>
            {run.index + 1}
          </Text>
          <Text variant="micro" tone="faint" tabular>
            / {run.total}
          </Text>
        </View>
        <Text variant="micro" tone="muted" tabular>
          {t('common.level', { level: run.level })}
        </Text>
      </View>
      <TimerBar durationMs={run.timeLimitMs} startedAt={run.inputOpenedAt} frozen={feedback !== null} onExpire={onExpire} />
      <View style={styles.stage}>
        <GameStage
          key={run.trialKey}
          gameId={gameId}
          trial={run.trial}
          level={run.level}
          onInputOpen={run.openInput}
          onAnswer={run.answer}
          locked={feedback !== null}
          shapeMode={shapeMode}
          reduceMotion={reduceMotion}
        />
        <FeedbackFlash kind={feedback} reduceMotion={reduceMotion} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: spacing.sm },
  meta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  count: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.xs },
  stage: { flex: 1, marginTop: spacing.md },
});

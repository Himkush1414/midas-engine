import { GameRun, type AnyGameDefinition, type GameMode, type RunSummary, type TrialRecord } from '@mindtier/core';
import { useCallback, useRef, useState } from 'react';

export type FeedbackKind = 'correct' | 'wrong' | 'partial' | null;

/** Immutable view of the run for rendering; refreshed after every trial. */
interface Snapshot<TTrial> {
  trial: TTrial | null;
  trialKey: number;
  index: number;
  total: number;
  level: number;
  timeLimitMs: number | null;
  done: boolean;
}

export interface GameRunController<TTrial = unknown, TResponse = unknown> extends Snapshot<TTrial> {
  /** performance.now() when input opened for the current trial, or null before. */
  inputOpenedAt: number | null;
  feedback: FeedbackKind;
  /** Call when the trial is ready for input (memory games call it after the reveal). */
  openInput(): void;
  answer(response: TResponse | null): TrialRecord<TResponse> | null;
  /** Called by the host after the feedback flash. */
  advance(): void;
  /** Restart timing of the current trial (after a pause). */
  restartTrial(): void;
  summary(): RunSummary;
}

const now = () => (globalThis.performance?.now ? globalThis.performance.now() : Date.now());

function snapshot<TTrial, TResponse>(run: GameRun<TTrial, TResponse>, trialKey: number): Snapshot<TTrial> {
  return {
    trial: run.done ? null : run.currentTrial(),
    trialKey,
    index: run.index,
    total: run.trialCount,
    level: run.done ? 0 : run.currentLevel,
    timeLimitMs: run.done ? null : run.timeLimitMs,
    done: run.done,
  };
}

export function useGameRun<TTrial, TResponse>(
  def: AnyGameDefinition,
  options: { mode: GameMode; seed: string; rating?: number; trialCount?: number },
): GameRunController<TTrial, TResponse> {
  const [run] = useState(
    () =>
      new GameRun<TTrial, TResponse>(def, {
        mode: options.mode,
        seed: options.seed,
        ...(options.rating !== undefined ? { rating: options.rating } : {}),
        ...(options.trialCount !== undefined ? { trialCount: options.trialCount } : {}),
      }),
  );
  const [snap, setSnap] = useState<Snapshot<TTrial>>(() => snapshot(run, 0));
  const [inputOpenedAt, setInputOpenedAt] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<FeedbackKind>(null);
  const answeredRef = useRef(false);
  const openedRef = useRef<number | null>(null);

  const openInput = useCallback(() => {
    if (openedRef.current !== null) return;
    openedRef.current = now();
    setInputOpenedAt(openedRef.current);
  }, []);

  const answer = useCallback(
    (response: TResponse | null) => {
      if (answeredRef.current || run.done) return null;
      answeredRef.current = true;
      const opened = openedRef.current ?? now();
      const limit = run.timeLimitMs;
      // A null response means the window expired: record it just past the limit.
      const rtMs = response === null && limit !== null ? limit + 1 : Math.max(0, now() - opened);
      const record = run.submit(response, rtMs);
      setFeedback(record.correct ? 'correct' : record.score > 0 ? 'partial' : 'wrong');
      return record;
    },
    [run],
  );

  const resetTrialState = () => {
    answeredRef.current = false;
    openedRef.current = null;
    setInputOpenedAt(null);
  };

  const advance = useCallback(() => {
    resetTrialState();
    setFeedback(null);
    setSnap((s) => snapshot(run, s.trialKey + 1));
  }, [run]);

  const restartTrial = useCallback(() => {
    if (answeredRef.current) return;
    resetTrialState();
    setSnap((s) => ({ ...s, trialKey: s.trialKey + 1 }));
  }, []);

  const summary = useCallback(() => run.summary(), [run]);

  return { ...snap, inputOpenedAt, feedback, openInput, answer, advance, restartTrial, summary };
}

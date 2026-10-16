import type { Domain } from '../domains';
import type { Rng } from '../random';

export const GAME_IDS = [
  'grid-recall',
  'path-trace',
  'echo',
  'flank',
  'clash',
  'spot',
  'snap',
  'match',
  'pattern',
  'balance',
  'route',
  'quick-sum',
  'estimate',
] as const;
export type GameId = (typeof GAME_IDS)[number];

export interface TrialOutcome {
  /** Drives the staircase. */
  correct: boolean;
  /** Partial credit in [0, 1]; equals 0/1 for all-or-nothing games. */
  score: number;
}

/**
 * A game is a pure, deterministic description: trials are generated from an
 * Rng and an integer level, and responses are evaluated without side effects.
 * The same definition runs in the app (to play) and on the server (to verify).
 */
export interface GameDefinition<TTrial = unknown, TResponse = unknown> {
  id: GameId;
  domain: Domain;
  name: string;
  /** One-line rules shown on the intro card. */
  rules: string;
  /** Highest level; levels are integers in [1, maxLevel]. */
  maxLevel: number;
  /** Trials in one rated game. */
  trialCount: number;
  /**
   * Probability of a correct answer by guessing (0 for free responses, 0.5 for
   * yes/no, 0.25 for four options). Used for chance-corrected scoring.
   */
  chance: number;
  generate(rng: Rng, level: number): TTrial;
  /**
   * Evaluate a response. `rtMs` is the response time; responses past the
   * trial's time limit are already converted to `null` by the runner.
   */
  evaluate(trial: TTrial, response: TResponse | null, rtMs: number): TrialOutcome;
  /** Per-trial answer window in ms (null = untimed). Zen mode ignores it. */
  timeLimitMs(level: number): number | null;
  /** Fastest plausible human response in ms, used by server validation. */
  minHumanRtMs: number;
  /** Type guard used to validate untrusted responses from clients. */
  isResponse(value: unknown): value is TResponse;
}

export type AnyGameDefinition = GameDefinition<any, any>;

export type GameMode = 'placement' | 'ranked' | 'zen' | 'daily' | 'duel';

/** Modes that adapt difficulty to the player; the others use a fixed ramp. */
export const ADAPTIVE_MODES: readonly GameMode[] = ['placement', 'ranked', 'zen'];
export const RATED_MODES: readonly GameMode[] = ['placement', 'ranked'];

export interface TrialRecord<TResponse = unknown> {
  level: number;
  response: TResponse | null;
  rtMs: number;
  correct: boolean;
  score: number;
}

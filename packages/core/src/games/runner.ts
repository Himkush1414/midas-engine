import { Rng, seedFor } from '../random';
import { fixedRamp, nextLevel, playableLevel } from '../staircase';
import { ADAPTIVE_MODES, type AnyGameDefinition, type GameId, type GameMode, type TrialRecord } from './types';

/** Lowest and highest item ratings; levels map linearly between them. */
export const ITEM_RATING_MIN = 700;
export const ITEM_RATING_MAX = 2400;
/** Items are treated as well-known opponents. */
export const ITEM_RD = 60;
/** Trials per Glicko "game" when a run is converted into rating results. */
export const BLOCKS_PER_GAME = 3;

export function levelToItemRating(level: number, maxLevel: number): number {
  if (maxLevel <= 1) return ITEM_RATING_MIN;
  const t = (level - 1) / (maxLevel - 1);
  return ITEM_RATING_MIN + t * (ITEM_RATING_MAX - ITEM_RATING_MIN);
}

/** Continuous level whose item rating equals `rating` (clamped to the level range). */
export function ratingToLevel(rating: number, maxLevel: number): number {
  const t = (rating - ITEM_RATING_MIN) / (ITEM_RATING_MAX - ITEM_RATING_MIN);
  return Math.min(maxLevel, Math.max(1, 1 + t * (maxLevel - 1)));
}

export function trialSeed(runSeed: string, gameId: string, index: number): string {
  return seedFor(runSeed, gameId, index);
}

/** Deterministically build the trial content for (seed, index, level). */
export function buildTrial<T>(def: AnyGameDefinition, runSeed: string, index: number, level: number): T {
  return def.generate(new Rng(trialSeed(runSeed, def.id, index)), level) as T;
}

export interface RunOptions {
  mode: GameMode;
  seed: string;
  /** Player's current domain rating; sets the starting level for adaptive modes. */
  rating?: number;
  /** Override the number of trials (tutorial/practice rounds). */
  trialCount?: number;
}

export interface BlockResult {
  itemRating: number;
  score: number;
}

export interface RunSummary {
  gameId: GameId;
  mode: GameMode;
  seed: string;
  startLevel: number;
  trials: TrialRecord[];
  accuracy: number;
  /** Chance-corrected score in [0, 1]. */
  correctedScore: number;
  /** Rating results for Glicko-2 (adaptive modes). */
  blocks: BlockResult[];
  /** Points for fixed-ramp modes (Daily Challenge, duels); 0 otherwise. */
  points: number;
  peakLevel: number;
  durationMs: number;
}

export function correctForChance(accuracy: number, chance: number): number {
  if (chance >= 1) return 0;
  return Math.min(1, Math.max(0, (accuracy - chance) / (1 - chance)));
}

export function trialPoints(def: AnyGameDefinition, record: TrialRecord): number {
  if (record.score <= 0) return 0;
  const base = 50 + record.level * 10;
  const limit = def.timeLimitMs(record.level);
  const speed = limit ? Math.max(0, 1 - record.rtMs / limit) * 20 : 0;
  return Math.round(record.score * base + (record.correct ? speed : 0));
}

/**
 * Plays one game. The UI asks for `currentTrial()`, renders it, then calls
 * `submit()` with the player's response. Pure and serializable, so the same
 * sequence can be replayed on the server for verification.
 */
export class GameRun<TTrial = unknown, TResponse = unknown> {
  readonly def: AnyGameDefinition;
  readonly mode: GameMode;
  readonly seed: string;
  readonly startLevel: number;
  readonly trialCount: number;
  private readonly ramp: number[] | null;
  private level: number;
  private trial: TTrial | null = null;
  private readonly records: TrialRecord<TResponse>[] = [];

  constructor(def: AnyGameDefinition, options: RunOptions) {
    this.def = def;
    this.mode = options.mode;
    this.seed = options.seed;
    this.trialCount = options.trialCount ?? def.trialCount;
    const adaptive = ADAPTIVE_MODES.includes(options.mode);
    this.ramp = adaptive ? null : fixedRamp(this.trialCount, def.maxLevel);
    this.level = adaptive ? ratingToLevel(options.rating ?? 1300, def.maxLevel) : (this.ramp?.[0] ?? 1);
    this.startLevel = this.level;
  }

  get index(): number {
    return this.records.length;
  }

  get done(): boolean {
    return this.records.length >= this.trialCount;
  }

  /** Integer level of the current trial. */
  get currentLevel(): number {
    if (this.ramp) return this.ramp[this.index] ?? this.ramp[this.ramp.length - 1] ?? 1;
    return playableLevel(this.level, this.def.maxLevel);
  }

  /** Time limit for the current trial, or null in Zen and untimed games. */
  get timeLimitMs(): number | null {
    return this.mode === 'zen' ? null : this.def.timeLimitMs(this.currentLevel);
  }

  currentTrial(): TTrial {
    if (this.done) throw new Error('run is complete');
    if (this.trial === null) this.trial = buildTrial<TTrial>(this.def, this.seed, this.index, this.currentLevel);
    return this.trial;
  }

  submit(response: TResponse | null, rtMs: number): TrialRecord<TResponse> {
    const trial = this.currentTrial();
    const level = this.currentLevel;
    const limit = this.timeLimitMs;
    const timedOut = limit !== null && rtMs > limit;
    const effective = timedOut ? null : response;
    const outcome = this.def.evaluate(trial, effective, rtMs);
    const record: TrialRecord<TResponse> = { level, response: effective, rtMs: Math.round(rtMs), ...outcome };
    this.records.push(record);
    if (!this.ramp) {
      const placement = this.mode === 'placement';
      this.level = nextLevel(this.level, outcome.correct, this.records.length - 1, {
        maxLevel: this.def.maxLevel,
        chance: this.def.chance,
        ...(placement ? { fastTrials: 4, fastFactor: 2 } : {}),
      });
    }
    this.trial = null;
    return record;
  }

  get history(): readonly TrialRecord<TResponse>[] {
    return this.records;
  }

  summary(): RunSummary {
    return summarize(this.def, this.mode, this.seed, this.startLevel, this.records);
  }
}

export function summarize(
  def: AnyGameDefinition,
  mode: GameMode,
  seed: string,
  startLevel: number,
  trials: readonly TrialRecord[],
): RunSummary {
  const n = trials.length;
  const accuracy = n === 0 ? 0 : trials.reduce((s, t) => s + t.score, 0) / n;
  const blocks: BlockResult[] = [];
  if (ADAPTIVE_MODES.includes(mode) && n > 0) {
    const size = Math.ceil(n / BLOCKS_PER_GAME);
    for (let i = 0; i < n; i += size) {
      const chunk = trials.slice(i, i + size);
      const acc = chunk.reduce((s, t) => s + t.score, 0) / chunk.length;
      const itemRating = chunk.reduce((s, t) => s + levelToItemRating(t.level, def.maxLevel), 0) / chunk.length;
      blocks.push({ itemRating, score: correctForChance(acc, def.chance) });
    }
  }
  const points = ADAPTIVE_MODES.includes(mode) ? 0 : trials.reduce((s, t) => s + trialPoints(def, t), 0);
  return {
    gameId: def.id,
    mode,
    seed,
    startLevel,
    trials: trials.slice(),
    accuracy,
    correctedScore: correctForChance(accuracy, def.chance),
    blocks,
    points,
    peakLevel: trials.reduce((m, t) => (t.correct ? Math.max(m, t.level) : m), 0),
    durationMs: trials.reduce((s, t) => s + t.rtMs, 0),
  };
}

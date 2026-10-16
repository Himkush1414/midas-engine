import { buildTrial, summarize, type RunSummary } from './games/runner';
import { getGame, isGameId } from './games/registry';
import { ADAPTIVE_MODES, GAME_IDS, type GameMode, type TrialRecord } from './games/types';
import { fixedRamp, nextLevel, playableLevel } from './staircase';

/** What a client uploads for one finished game. Only responses and timings are trusted inputs. */
export interface SubmittedRun {
  gameId: string;
  mode: GameMode;
  seed: string;
  /** Continuous starting level for adaptive modes. */
  startLevel: number;
  trials: Array<{ level: number; response: unknown; rtMs: number }>;
}

export type VerifyIssue =
  | 'unknown-game'
  | 'bad-mode'
  | 'bad-start-level'
  | 'wrong-trial-count'
  | 'level-mismatch'
  | 'invalid-response'
  | 'bad-timing'
  | 'too-fast';

export interface VerifyResult {
  ok: boolean;
  issues: VerifyIssue[];
  /** Authoritative summary recomputed from scratch, present when ok. */
  summary?: RunSummary;
  /** Share of answered trials faster than humanly plausible. */
  fastShare: number;
}

const MODES: readonly GameMode[] = ['placement', 'ranked', 'zen', 'daily', 'duel'];
/** Reject a run when more than this share of answers is impossibly fast. */
const MAX_FAST_SHARE = 0.2;
const MAX_TRIAL_MS = 120_000;

export function verifyRun(input: SubmittedRun, expectedTrialCount?: number): VerifyResult {
  const issues: VerifyIssue[] = [];
  const fail = (issue: VerifyIssue): VerifyResult => ({ ok: false, issues: [...issues, issue], fastShare: 0 });

  if (!isGameId(input.gameId)) return fail('unknown-game');
  if (!MODES.includes(input.mode)) return fail('bad-mode');
  const def = getGame(input.gameId);
  const count = expectedTrialCount ?? def.trialCount;
  if (!Array.isArray(input.trials) || input.trials.length !== count) return fail('wrong-trial-count');

  const adaptive = ADAPTIVE_MODES.includes(input.mode);
  if (adaptive && !(Number.isFinite(input.startLevel) && input.startLevel >= 1 && input.startLevel <= def.maxLevel)) {
    return fail('bad-start-level');
  }
  const ramp = adaptive ? null : fixedRamp(count, def.maxLevel);

  let level = adaptive ? input.startLevel : 1;
  let fast = 0;
  let answered = 0;
  const records: TrialRecord[] = [];

  for (let i = 0; i < input.trials.length; i++) {
    const t = input.trials[i]!;
    const expectedLevel = ramp ? (ramp[i] as number) : playableLevel(level, def.maxLevel);
    if (t.level !== expectedLevel) return fail('level-mismatch');
    if (!(Number.isFinite(t.rtMs) && t.rtMs >= 0 && t.rtMs <= MAX_TRIAL_MS)) return fail('bad-timing');
    if (t.response !== null && !def.isResponse(t.response)) return fail('invalid-response');

    const trial = buildTrial(def, input.seed, i, expectedLevel);
    const limit = input.mode === 'zen' ? null : def.timeLimitMs(expectedLevel);
    const response = limit !== null && t.rtMs > limit ? null : t.response;
    const outcome = def.evaluate(trial, response, t.rtMs);

    if (response !== null) {
      answered++;
      if (t.rtMs < def.minHumanRtMs && outcome.correct) fast++;
    }
    records.push({ level: expectedLevel, response, rtMs: Math.round(t.rtMs), ...outcome });

    if (adaptive) {
      level = nextLevel(level, outcome.correct, i, {
        maxLevel: def.maxLevel,
        chance: def.chance,
        ...(input.mode === 'placement' ? { fastTrials: 4, fastFactor: 2 } : {}),
      });
    }
  }

  const fastShare = answered === 0 ? 0 : fast / answered;
  if (fastShare > MAX_FAST_SHARE) return { ok: false, issues: [...issues, 'too-fast'], fastShare };

  return {
    ok: true,
    issues,
    fastShare,
    summary: summarize(def, input.mode, input.seed, input.startLevel, records),
  };
}

/** Serialize a finished client run into the upload format. */
export function toSubmission(summary: RunSummary): SubmittedRun {
  return {
    gameId: summary.gameId,
    mode: summary.mode,
    seed: summary.seed,
    startLevel: summary.startLevel,
    trials: summary.trials.map((t) => ({ level: t.level, response: t.response, rtMs: t.rtMs })),
  };
}

export const KNOWN_GAME_IDS = GAME_IDS;

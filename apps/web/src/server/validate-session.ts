import {
  DOMAINS,
  addDays,
  applySession,
  dailyPlan,
  duelPlan,
  gameSeed,
  getGame,
  isGameId,
  placementPlan,
  seedFor,
  utcDayKey,
  verifyRun,
  type DomainRatings,
  type GameId,
  type GameMode,
  type RunSummary,
  type SessionUpdate,
  type SubmittedRun,
} from '@mindtier/core';

export const UPLOAD_MODES = ['placement', 'ranked', 'daily', 'duel'] as const;
export type UploadMode = (typeof UPLOAD_MODES)[number];

export interface SessionUpload {
  id: string;
  mode: UploadMode;
  seed: string;
  games: string[];
  sessionIndex: number | null;
  runs: SubmittedRun[];
}

export interface ValidationContext {
  profileSeed: string;
  now: Date;
  ratings: DomainRatings;
  /** Present when the upload is for a duel that exists. */
  duel?: { id: string; expiresAt: Date } | null;
}

export type ValidationResult =
  | {
      ok: true;
      mode: UploadMode;
      day: string;
      summaries: RunSummary[];
      update: SessionUpdate | null;
      points: number;
      accuracy: number;
      duelId: string | null;
    }
  | { ok: false; status: 400 | 403 | 404 | 409 | 410 | 422; error: string };

const fail = (status: 400 | 403 | 404 | 409 | 410 | 422, error: string): ValidationResult => ({ ok: false, status, error });

const sameList = (a: readonly string[], b: readonly string[]) => a.length === b.length && a.every((x, i) => x === b[i]);

/** Re-derives the plan the server expects and checks the upload against it. */
function checkPlan(u: SessionUpload, ctx: ValidationContext): { ok: true; day: string; duelId: string | null } | ValidationResult {
  const today = utcDayKey(ctx.now);
  if (!u.games.every(isGameId)) return fail(400, 'unknown game');
  const games = u.games as GameId[];

  switch (u.mode) {
    case 'placement': {
      const plan = placementPlan(ctx.profileSeed);
      if (u.seed !== plan.seed || !sameList(games, plan.games)) return fail(422, 'placement plan mismatch');
      return { ok: true, day: today, duelId: null };
    }
    case 'ranked': {
      const index = u.sessionIndex;
      if (index === null || !Number.isInteger(index) || index < 0 || index > 1_000_000) return fail(400, 'bad session index');
      if (games.length !== 3) return fail(422, 'ranked sessions have three games');
      const domains = games.map((g) => getGame(g).domain);
      if (u.seed === seedFor('ranked', ctx.profileSeed, index)) {
        if (new Set(domains).size !== 3) return fail(422, 'ranked games must cover three domains');
        return { ok: true, day: today, duelId: null };
      }
      const focusDomain = DOMAINS.find((d) => u.seed === seedFor('focus', ctx.profileSeed, d, index));
      if (focusDomain && domains.every((d) => d === focusDomain)) return { ok: true, day: today, duelId: null };
      return fail(422, 'ranked seed mismatch');
    }
    case 'daily': {
      const day = u.seed.split('|')[1] ?? '';
      // Allow late uploads from yesterday (offline play across midnight UTC).
      if (day !== today && day !== addDays(today, -1)) return fail(410, 'daily challenge closed');
      const plan = dailyPlan(day);
      if (u.seed !== plan.seed || !sameList(games, plan.games)) return fail(422, 'daily plan mismatch');
      return { ok: true, day, duelId: null };
    }
    case 'duel': {
      const duelId = u.seed.split('|')[1] ?? '';
      if (!ctx.duel || ctx.duel.id !== duelId) return fail(404, 'duel not found');
      if (ctx.duel.expiresAt.getTime() < ctx.now.getTime()) return fail(410, 'duel expired');
      const plan = duelPlan(duelId);
      if (u.seed !== plan.seed || !sameList(games, plan.games)) return fail(422, 'duel plan mismatch');
      return { ok: true, day: today, duelId };
    }
  }
}

export function validateSession(u: SessionUpload, ctx: ValidationContext): ValidationResult {
  if (!(UPLOAD_MODES as readonly string[]).includes(u.mode)) return fail(400, 'bad mode');
  if (!Array.isArray(u.runs) || u.runs.length !== u.games.length || u.runs.length === 0) return fail(400, 'runs do not match games');

  const plan = checkPlan(u, ctx);
  if (!('day' in plan)) return plan;

  const summaries: RunSummary[] = [];
  for (let i = 0; i < u.runs.length; i++) {
    const run = u.runs[i]!;
    if (run.gameId !== u.games[i]) return fail(422, `game ${i} mismatch`);
    if (run.mode !== (u.mode as GameMode)) return fail(422, `game ${i} mode mismatch`);
    if (run.seed !== gameSeed({ seed: u.seed }, i)) return fail(422, `game ${i} seed mismatch`);
    const verified = verifyRun(run);
    if (!verified.ok || !verified.summary) return fail(422, `game ${i} rejected: ${verified.issues.join(', ')}`);
    summaries.push(verified.summary);
  }

  const rated = u.mode === 'placement' || u.mode === 'ranked';
  const update = rated ? applySession(ctx.ratings, summaries) : null;
  return {
    ok: true,
    mode: u.mode,
    day: plan.day,
    summaries,
    update,
    points: summaries.reduce((s, r) => s + r.points, 0),
    accuracy: summaries.reduce((s, r) => s + r.accuracy, 0) / summaries.length,
    duelId: plan.duelId,
  };
}

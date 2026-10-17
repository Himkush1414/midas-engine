import { canStartRanked, getGame, type SubmittedRun } from '@mindtier/core';
import { z } from 'zod';
import { HttpError, handler, json, parseBody, requireUser } from '@/server/http';
import { recordLeagueSession } from '@/server/leagues';
import { currentRatings, getRatings, isPro, requireProfile, usageToday } from '@/server/players';
import { supabaseAdmin } from '@/server/supabase';
import { duelResultMessage, sendPush } from '@/server/push';
import { UPLOAD_MODES, validateSession } from '@/server/validate-session';

const Run = z.object({
  gameId: z.string().max(32),
  mode: z.string().max(16),
  seed: z.string().max(200),
  startLevel: z.number().finite(),
  trials: z
    .array(z.object({ level: z.number().int(), response: z.unknown(), rtMs: z.number().finite() }))
    .max(64),
});

const Body = z.object({
  id: z.uuid(),
  mode: z.enum(UPLOAD_MODES),
  seed: z.string().max(200),
  games: z.array(z.string().max(32)).min(1).max(5),
  sessionIndex: z.number().int().nullable(),
  runs: z.array(Run).min(1).max(5),
});

export const POST = handler(async (req: Request) => {
  const user = await requireUser(req);
  const body = await parseBody(req, Body);
  const profile = await requireProfile(user.id);
  const db = supabaseAdmin();
  const now = new Date();

  // Idempotency: a retried upload returns the current state.
  const { data: seen } = await db.from('sessions').select('id').eq('id', body.id).maybeSingle();
  if (seen) return json({ status: 'duplicate', ratings: await getRatings(user.id) });

  if (body.mode === 'ranked') {
    const [pro, usage] = await Promise.all([isPro(user.id, now), usageToday(user.id, now)]);
    if (!canStartRanked(pro, usage)) throw new HttpError(402, 'daily ranked limit reached');
  }

  let duel: { id: string; expiresAt: Date } | null = null;
  if (body.mode === 'duel') {
    const duelId = body.seed.split('|')[1] ?? '';
    const { data } = await db.from('duels').select('id, expires_at').eq('id', duelId).maybeSingle();
    if (data) duel = { id: data.id, expiresAt: new Date(data.expires_at) };
  }

  const ratings = await currentRatings(profile, now);
  const result = validateSession(
    { ...body, runs: body.runs as SubmittedRun[] },
    { profileSeed: profile.seed, now, ratings, duel },
  );
  if (!result.ok) throw new HttpError(result.status, result.error);

  // Only the domains that changed are written; games counts per domain.
  const changed = new Map<string, { rating: number; rd: number; volatility: number; games: number }>();
  for (const u of result.update?.updates ?? []) {
    const prev = changed.get(u.domain);
    changed.set(u.domain, { ...u.after, games: (prev?.games ?? 0) + 1 });
  }

  const { data: status, error } = await db.rpc('submit_session', {
    p_user: user.id,
    p_session: {
      id: body.id,
      mode: body.mode,
      seed: body.seed,
      session_index: body.mode === 'ranked' ? body.sessionIndex : null,
      day: result.day,
      games: body.games,
      points: result.points,
      accuracy: result.accuracy,
    },
    p_ratings: [...changed].map(([domain, r]) => ({ domain, ...r })),
    p_results: result.summaries.map((s) => ({
      game_id: s.gameId,
      accuracy: s.accuracy,
      points: s.points,
      peak_level: s.peakLevel,
      fast_share: 0,
    })),
    p_daily: body.mode === 'daily' ? { day: result.day, points: result.points, accuracy: result.summaries.map((s) => s.accuracy) } : null,
    p_duel:
      body.mode === 'duel' && result.duelId
        ? { duel_id: result.duelId, points: result.points, accuracy: result.summaries.map((s) => s.accuracy) }
        : null,
  });
  if (error) {
    // Unique violations: a second placement, a reused ranked index, or a second daily/duel entry.
    if (error.code === '23505') throw new HttpError(409, 'session already recorded');
    throw error;
  }

  if (status === 'ok' && body.mode === 'ranked' && result.update) {
    await recordLeagueSession(profile, { now, day: result.day, points: result.points, ratings: result.update.ratings });
  }

  if (status === 'ok' && body.mode === 'duel' && result.duelId) {
    await notifyDuelOpponents(result.duelId, user.id, profile.display_name ?? 'Your friend', result.points);
  }

  return json({
    status,
    ratings: result.update?.ratings ?? ratings,
    updates: (result.update?.updates ?? []).map((u) => ({
      domain: u.domain,
      gameId: u.gameId,
      game: getGame(u.gameId).name,
      before: u.before,
      after: u.after,
      delta: u.delta,
      change: u.change,
    })),
    points: result.points,
  });
});

/** Tell everyone else in the duel how this run compares with theirs. Best-effort. */
async function notifyDuelOpponents(duelId: string, playerId: string, playerName: string, points: number) {
  try {
    const db = supabaseAdmin();
    const { data: duel } = await db.from('duels').select('creator_id').eq('id', duelId).maybeSingle();
    const { data: entries } = await db.from('duel_entries').select('user_id, points').eq('duel_id', duelId);
    const others = new Set<string>([...(entries ?? []).map((e) => e.user_id), ...(duel ? [duel.creator_id] : [])]);
    others.delete(playerId);
    if (others.size === 0) return;
    const { data: tokens } = await db.from('push_tokens').select('user_id, token').in('user_id', [...others]);
    const pointsOf = new Map((entries ?? []).map((e) => [e.user_id, e.points] as const));
    await sendPush(
      (tokens ?? []).map((t) =>
        duelResultMessage({ token: t.token, duelId, playerName, playerPoints: points, recipientPoints: pointsOf.get(t.user_id) ?? null }),
      ),
    );
  } catch (e) {
    console.warn('duel notify failed', e);
  }
}

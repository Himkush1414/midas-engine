import { canCreateDuel, duelPlan } from '@mindtier/core';
import { HttpError, handler, json, requireUser } from '@/server/http';
import { duelId } from '@/server/ids';
import { isPro, requireProfile, usageToday } from '@/server/players';
import { supabaseAdmin } from '@/server/supabase';
import { SITE } from '@/lib/site';

/** Create a duel. Both players later play duelPlan(id). */
export const POST = handler(async (req: Request) => {
  const user = await requireUser(req);
  await requireProfile(user.id);
  const [pro, usage] = await Promise.all([isPro(user.id), usageToday(user.id)]);
  if (!canCreateDuel(pro, usage)) throw new HttpError(402, 'daily duel limit reached');

  const db = supabaseAdmin();
  for (let attempt = 0; attempt < 3; attempt++) {
    const id = duelId();
    const { data, error } = await db.from('duels').insert({ id, creator_id: user.id }).select('id, created_at, expires_at').single();
    if (!error) {
      const plan = duelPlan(data.id);
      return json(
        { id: data.id, createdAt: data.created_at, expiresAt: data.expires_at, games: plan.games, url: `${SITE.url}/duel/${data.id}` },
        201,
      );
    }
    if (error.code !== '23505') throw error; // retry only on id collision
  }
  throw new HttpError(503, 'could not allocate a duel code');
});

import { z } from 'zod';
import { getRatings, isPro, usageToday } from '@/server/players';
import { handler, json, parseBody, requireUser } from '@/server/http';
import { supabaseAdmin } from '@/server/supabase';

const Body = z.object({ seed: z.string().min(8).max(64) });

/**
 * Creates the player's profile on first contact (registering the client seed
 * used for ranked plans) and returns their authoritative state.
 */
export const POST = handler(async (req: Request) => {
  const user = await requireUser(req);
  const { seed } = await parseBody(req, Body);
  const db = supabaseAdmin();

  const { data: existing, error: readErr } = await db.from('profiles').select('id, seed, display_name').eq('id', user.id).maybeSingle();
  if (readErr) throw readErr;
  let profile = existing;
  if (!profile) {
    const { data, error } = await db.from('profiles').insert({ id: user.id, seed }).select('id, seed, display_name').single();
    if (error) throw error;
    profile = data;
  }

  const [ratings, pro, usage, last] = await Promise.all([
    getRatings(user.id),
    isPro(user.id),
    usageToday(user.id),
    db
      .from('sessions')
      .select('session_index')
      .eq('user_id', user.id)
      .eq('mode', 'ranked')
      .order('session_index', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);
  if (last.error) throw last.error;
  const { count: placements, error: placementErr } = await db
    .from('sessions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('mode', 'placement');
  if (placementErr) throw placementErr;
  return json({
    profile: { id: profile.id, seed: profile.seed, displayName: profile.display_name },
    ratings,
    isPro: pro,
    usage,
    // Lets a second device continue the ranked sequence without reusing an index.
    nextSessionIndex: (last.data?.session_index ?? -1) + 1,
    placementDone: (placements ?? 0) > 0,
  });
});

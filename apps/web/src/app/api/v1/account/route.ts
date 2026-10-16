import { z } from 'zod';
import { HttpError, handler, json, parseBody, requireUser } from '@/server/http';
import { checkDisplayName } from '@/server/names';
import { requireProfile } from '@/server/players';
import { supabaseAdmin } from '@/server/supabase';

const Patch = z.object({ displayName: z.string().max(64) });

/** Change the public display name. */
export const PATCH = handler(async (req: Request) => {
  const user = await requireUser(req);
  await requireProfile(user.id);
  const { displayName } = await parseBody(req, Patch);
  const check = checkDisplayName(displayName);
  if (!check.ok) throw new HttpError(422, check.reason);
  const { error } = await supabaseAdmin().from('profiles').update({ display_name: check.name }).eq('id', user.id);
  if (error) throw error;
  return json({ displayName: check.name });
});

/**
 * Permanently delete the account. Removing the auth user cascades to the
 * profile, ratings, history, sessions, results, leaderboard and duel entries,
 * entitlements, push tokens and analytics events.
 * Store subscriptions are managed by Google/Apple and must be cancelled there.
 */
export const DELETE = handler(async (req: Request) => {
  const user = await requireUser(req);
  const { error } = await supabaseAdmin().auth.admin.deleteUser(user.id);
  if (error) throw error;
  return json({ deleted: true });
});

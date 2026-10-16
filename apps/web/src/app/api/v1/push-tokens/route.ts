import { z } from 'zod';
import { HttpError, handler, json, parseBody, requireUser } from '@/server/http';
import { requireProfile } from '@/server/players';
import { EXPO_TOKEN } from '@/server/push';
import { supabaseAdmin } from '@/server/supabase';

const Body = z.object({ token: z.string().max(200), platform: z.enum(['android', 'ios']) });

/** Register this device for duel notifications. */
export const POST = handler(async (req: Request) => {
  const user = await requireUser(req);
  await requireProfile(user.id);
  const { token, platform } = await parseBody(req, Body, 2_000);
  if (!EXPO_TOKEN.test(token)) throw new HttpError(422, 'invalid push token');
  const { error } = await supabaseAdmin()
    .from('push_tokens')
    .upsert({ user_id: user.id, token, platform, updated_at: new Date().toISOString() });
  if (error) throw error;
  return json({ registered: true });
});

/** Stop duel notifications on this device. */
export const DELETE = handler(async (req: Request) => {
  const user = await requireUser(req);
  const { token } = await parseBody(req, z.object({ token: z.string().max(200) }), 2_000);
  const { error } = await supabaseAdmin().from('push_tokens').delete().eq('user_id', user.id).eq('token', token);
  if (error) throw error;
  return json({ removed: true });
});

import { z } from 'zod';
import { HttpError, handler, json, parseBody } from '@/server/http';
import { supabaseAdmin } from '@/server/supabase';

const Body = z.object({
  email: z.email().max(254),
  note: z.string().max(1000).optional().default(''),
  // Honeypot field: real browsers leave it empty.
  website: z.string().max(0).optional(),
});

/**
 * Account deletion request from the public website (for people who no longer
 * have the app installed). Processed by the team within 30 days.
 */
export const POST = handler(async (req: Request) => {
  const { email, note } = await parseBody(req, Body, 4_000);
  const db = supabaseAdmin();
  const since = new Date(Date.now() - 86_400_000).toISOString();
  const { count, error: countErr } = await db
    .from('deletion_requests')
    .select('id', { count: 'exact', head: true })
    .eq('email', email.toLowerCase())
    .gte('created_at', since);
  if (countErr) throw countErr;
  if ((count ?? 0) >= 3) throw new HttpError(429, 'We already have your request. We will email you once it is processed.');
  const { error } = await db.from('deletion_requests').insert({ email: email.toLowerCase(), note: note || null });
  if (error) throw error;
  return json({ received: true }, 202);
});

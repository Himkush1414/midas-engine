import { z } from 'zod';
import { handler, json, optionalUser, parseBody } from '@/server/http';
import { supabaseAdmin } from '@/server/supabase';

const Prop = z.union([z.string().max(120), z.number().finite(), z.boolean(), z.null()]);
const Body = z.object({
  events: z
    .array(
      z.object({
        name: z.string().regex(/^[a-z_]{2,48}$/),
        props: z.record(z.string().max(40), Prop).refine((p) => Object.keys(p).length <= 12, 'too many props'),
        at: z.number().int().positive(),
      }),
    )
    .min(1)
    .max(100),
});

/** Anonymous product analytics. No personal data is accepted (string props are short and free-form keys are capped). */
export const POST = handler(async (req: Request) => {
  const user = await optionalUser(req);
  const { events } = await parseBody(req, Body, 64_000);
  const now = Date.now();
  const rows = events
    // Drop clock-skewed events older than 30 days or more than a day in the future.
    .filter((e) => e.at > now - 30 * 86_400_000 && e.at < now + 86_400_000)
    .map((e) => ({ user_id: user?.id ?? null, name: e.name, props: e.props, at: new Date(e.at).toISOString() }));
  if (rows.length > 0) {
    const { error } = await supabaseAdmin().from('events').insert(rows);
    // A missing profile (not yet bootstrapped) fails the FK: retry without the user link.
    if (error?.code === '23503') {
      const { error: e2 } = await supabaseAdmin().from('events').insert(rows.map((r) => ({ ...r, user_id: null })));
      if (e2) throw e2;
    } else if (error) {
      throw error;
    }
  }
  return json({ accepted: rows.length }, 202);
});

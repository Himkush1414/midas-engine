import { HttpError, handler, json } from '@/server/http';
import { entitlementFromEvent, safeEqual, targetUsers, type RevenueCatEvent } from '@/server/revenuecat';
import { supabaseAdmin } from '@/server/supabase';

/**
 * RevenueCat → Mindtier entitlement sync. Configure in RevenueCat:
 *   URL: https://<site>/api/v1/webhooks/revenuecat
 *   Authorization header: Bearer <REVENUECAT_WEBHOOK_SECRET>
 */
export const POST = handler(async (req: Request) => {
  const secret = process.env.REVENUECAT_WEBHOOK_SECRET;
  if (!secret) throw new HttpError(503, 'webhook not configured');
  const auth = req.headers.get('authorization') ?? '';
  const presented = auth.startsWith('Bearer ') ? auth.slice(7) : auth;
  if (!safeEqual(presented, secret)) throw new HttpError(401, 'unauthorised');

  const body = (await req.json().catch(() => null)) as { event?: RevenueCatEvent } | null;
  const event = body?.event;
  if (!event?.type) throw new HttpError(400, 'missing event');

  const db = supabaseAdmin();
  let applied = 0;
  for (const userId of targetUsers(event)) {
    const row = entitlementFromEvent(event, userId);
    if (!row) continue;
    const { data: profile } = await db.from('profiles').select('id').eq('id', userId).maybeSingle();
    if (!profile) continue; // unknown or deleted account: acknowledge so RevenueCat stops retrying
    const { error } = await db.from('entitlements').upsert({ ...row, updated_at: new Date().toISOString() });
    if (error) throw error;
    applied++;
  }
  // Transfers also revoke access from the previous owners.
  if (event.type === 'TRANSFER') {
    for (const from of event.transferred_from ?? []) {
      await db.from('entitlements').update({ is_pro: false, updated_at: new Date().toISOString() }).eq('user_id', from);
    }
  }
  return json({ ok: true, applied });
});

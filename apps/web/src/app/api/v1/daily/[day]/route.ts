import { HttpError, handler, json, optionalUser } from '@/server/http';
import { supabaseAdmin } from '@/server/supabase';

const NIL = '00000000-0000-0000-0000-000000000000';

export const GET = handler(async (req: Request, ctx: { params: Promise<{ day: string }> }) => {
  const { day } = await ctx.params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || Number.isNaN(Date.parse(`${day}T00:00:00Z`))) throw new HttpError(400, 'bad day');
  const user = await optionalUser(req);
  const { data, error } = await supabaseAdmin().rpc('daily_board', { p_day: day, p_user: user?.id ?? NIL, p_limit: 50 });
  if (error) throw error;
  const board = data as { total: number; top: unknown[]; me: { place: number; points: number; total: number } | null };
  const percentile = board.me && board.total > 0 ? Math.round((1 - (board.me.place - 1) / board.total) * 100) : null;
  return json({ day, total: board.total, top: board.top, me: board.me ? { ...board.me, percentile } : null }, 200, {
    'Cache-Control': user ? 'no-store' : 'public, max-age=30',
  });
});

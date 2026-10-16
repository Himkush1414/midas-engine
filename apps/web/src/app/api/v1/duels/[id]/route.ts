import { loadDuel } from '@/server/duels';
import { HttpError, handler, json, optionalUser } from '@/server/http';

export const GET = handler(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params;
  const viewer = await optionalUser(req);
  const duel = await loadDuel(id.toLowerCase(), viewer?.id ?? null);
  if (!duel) throw new HttpError(404, 'duel not found');
  return json(duel);
});

import { z } from 'zod';
import { handler, json, parseBody, requireUser } from '@/server/http';
import { leagueView, setLeagueOptIn } from '@/server/leagues';
import { requireProfile } from '@/server/players';

/** This week's league table for the caller, and how they finished last week. */
export const GET = handler(async (req: Request) => {
  const user = await requireUser(req);
  const profile = await requireProfile(user.id);
  return json(await leagueView(profile), 200, { 'Cache-Control': 'no-store' });
});

const Put = z.object({ optIn: z.boolean() });

/** Join or leave weekly leagues. */
export const PUT = handler(async (req: Request) => {
  const user = await requireUser(req);
  const profile = await requireProfile(user.id);
  const { optIn } = await parseBody(req, Put);
  await setLeagueOptIn(profile, optIn);
  return json(await leagueView(profile), 200, { 'Cache-Control': 'no-store' });
});

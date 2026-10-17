import 'server-only';
import { addDays, leagueBand, leaguePoints, leagueWeek, leagueWeekEnd, type DomainRatings, type RunSummary } from '@mindtier/core';
import type { Profile } from './players';
import { supabaseAdmin } from './supabase';

export interface LeagueMember {
  place: number;
  name: string;
  points: number;
  days: number;
  me: boolean;
}

export interface LeagueGroup {
  week: string;
  band: number;
  size: number;
  members: LeagueMember[];
}

export interface LeagueView {
  optedIn: boolean;
  week: string;
  endsAt: string;
  /** This week's group; null until the player's first scoring session of the week. */
  group: LeagueGroup | null;
  /** Where the player finished last week, if they played in a league. */
  lastWeek: { place: number; size: number; points: number } | null;
}

async function standings(userId: string, week: string): Promise<LeagueGroup | null> {
  const { data, error } = await supabaseAdmin().rpc('league_standings', { p_user: userId, p_week: week });
  if (error) throw error;
  return (data as LeagueGroup | null) ?? null;
}

export async function leagueView(profile: Profile, now = new Date()): Promise<LeagueView> {
  const week = leagueWeek(now);
  const base = { optedIn: profile.league_opt_in, week, endsAt: leagueWeekEnd(week).toISOString() };
  if (!profile.league_opt_in) return { ...base, group: null, lastWeek: null };
  const [group, previous] = await Promise.all([standings(profile.id, week), standings(profile.id, addDays(week, -7))]);
  const me = previous?.members.find((m) => m.me);
  return { ...base, group, lastWeek: me && previous ? { place: me.place, size: previous.size, points: me.points } : null };
}

/**
 * Score a finished ranked session for an opted-in player. Ranked games are
 * adaptive and carry no puzzle points, so league points come from the rated
 * blocks (see leaguePoints). Best effort: never fails the upload.
 */
export async function recordLeagueSession(
  profile: Profile,
  input: { now: Date; day: string; runs: ReadonlyArray<Pick<RunSummary, 'blocks'>>; ratings: DomainRatings },
): Promise<void> {
  if (!profile.league_opt_in) return;
  try {
    const { error } = await supabaseAdmin().rpc('league_record', {
      p_user: profile.id,
      p_week: leagueWeek(input.now),
      p_day: input.day,
      p_band: leagueBand(input.ratings),
      p_points: leaguePoints(input.runs),
    });
    if (error) throw error;
  } catch (e) {
    console.warn('league record failed', e);
  }
}

export async function setLeagueOptIn(profile: Profile, optIn: boolean, now = new Date()): Promise<void> {
  const db = supabaseAdmin();
  const { error } = await db.from('profiles').update({ league_opt_in: optIn }).eq('id', profile.id);
  if (error) throw error;
  profile.league_opt_in = optIn;
  if (!optIn) {
    // Leaving takes the player off this week's table straight away.
    const { error: e2 } = await db.from('league_members').delete().eq('user_id', profile.id).eq('week', leagueWeek(now));
    if (e2) throw e2;
  }
}

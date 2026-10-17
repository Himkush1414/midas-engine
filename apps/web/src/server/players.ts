import 'server-only';
import { DOMAINS, initialRatings, rollSeason, seasonOf, utcDayKey, type DomainRatings } from '@mindtier/core';
import { HttpError } from './http';
import { supabaseAdmin } from './supabase';

export interface Profile {
  id: string;
  seed: string;
  display_name: string | null;
  /** Season the stored ratings belong to (0 = preseason). */
  rating_season: number;
  league_opt_in: boolean;
}

export const PROFILE_COLUMNS = 'id, seed, display_name, rating_season, league_opt_in';

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabaseAdmin().from('profiles').select(PROFILE_COLUMNS).eq('id', userId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function requireProfile(userId: string): Promise<Profile> {
  const p = await getProfile(userId);
  if (!p) throw new HttpError(409, 'call /api/v1/bootstrap first');
  return p;
}

export async function getRatings(userId: string): Promise<DomainRatings> {
  const ratings = initialRatings();
  const { data, error } = await supabaseAdmin().from('ratings').select('domain, rating, rd, volatility').eq('user_id', userId);
  if (error) throw error;
  for (const row of data ?? []) {
    if ((DOMAINS as readonly string[]).includes(row.domain)) {
      ratings[row.domain as keyof DomainRatings] = { rating: row.rating, rd: row.rd, volatility: row.volatility };
    }
  }
  return ratings;
}

/**
 * The player's ratings brought into the current season. The first read after
 * a season change applies the soft reset and stores it, exactly once.
 */
export async function currentRatings(profile: Profile, now = new Date()): Promise<DomainRatings> {
  const ratings = await getRatings(profile.id);
  const rolled = rollSeason(ratings, profile.rating_season, seasonOf(now));
  if (!rolled.reset) return ratings;
  const { data: applied, error } = await supabaseAdmin().rpc('roll_season', {
    p_user: profile.id,
    p_season: rolled.season,
    p_ratings: DOMAINS.map((d) => ({ domain: d, rating: rolled.ratings[d].rating, rd: rolled.ratings[d].rd })),
  });
  if (error) throw error;
  profile.rating_season = rolled.season;
  // Another request rolled this player first: its result is what is stored.
  return applied ? rolled.ratings : getRatings(profile.id);
}

export async function isPro(userId: string, now = new Date()): Promise<boolean> {
  const { data, error } = await supabaseAdmin().from('entitlements').select('is_pro, expires_at').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  if (!data?.is_pro) return false;
  return data.expires_at === null || new Date(data.expires_at).getTime() > now.getTime();
}

export async function usageToday(userId: string, now = new Date()): Promise<{ rankedSessions: number; duelsCreated: number }> {
  const day = utcDayKey(now);
  const db = supabaseAdmin();
  const [ranked, duels] = await Promise.all([
    db.from('sessions').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('mode', 'ranked').eq('day', day),
    db.from('duels').select('id', { count: 'exact', head: true }).eq('creator_id', userId).gte('created_at', `${day}T00:00:00Z`),
  ]);
  if (ranked.error) throw ranked.error;
  if (duels.error) throw duels.error;
  return { rankedSessions: ranked.count ?? 0, duelsCreated: duels.count ?? 0 };
}

import 'server-only';
import { duelPlan } from '@mindtier/core';
import { supabaseAdmin } from './supabase';

export interface DuelView {
  id: string;
  createdAt: string;
  expiresAt: string;
  expired: boolean;
  games: string[];
  creatorName: string;
  entries: { name: string; points: number; accuracy: number[]; isCreator: boolean; isMe: boolean }[];
  winner: 'creator' | 'challenger' | 'draw' | null;
}

/** Public view of a duel. Never exposes user ids. */
export async function loadDuel(id: string, viewerId: string | null, now = new Date()): Promise<DuelView | null> {
  if (!/^[a-z0-9]{8}$/.test(id)) return null;
  const db = supabaseAdmin();
  const { data: duel, error } = await db.from('duels').select('id, creator_id, created_at, expires_at').eq('id', id).maybeSingle();
  if (error) throw error;
  if (!duel) return null;

  const { data: rows, error: e2 } = await db
    .from('duel_entries')
    .select('user_id, points, accuracy, created_at')
    .eq('duel_id', id)
    .order('created_at', { ascending: true })
    .limit(20);
  if (e2) throw e2;

  const ids = [...new Set([duel.creator_id, ...(rows ?? []).map((r) => r.user_id)])];
  const { data: profiles, error: e3 } = await db.from('profiles').select('id, display_name').in('id', ids);
  if (e3) throw e3;
  const nameOf = (uid: string) => profiles?.find((p) => p.id === uid)?.display_name ?? 'Player';

  const entries = (rows ?? []).map((r) => ({
    name: nameOf(r.user_id),
    points: r.points,
    accuracy: r.accuracy,
    isCreator: r.user_id === duel.creator_id,
    isMe: r.user_id === viewerId,
  }));
  const creator = entries.find((e) => e.isCreator);
  const challenger = entries.find((e) => !e.isCreator);
  const winner =
    creator && challenger ? (creator.points === challenger.points ? 'draw' : creator.points > challenger.points ? 'creator' : 'challenger') : null;

  return {
    id: duel.id,
    createdAt: duel.created_at,
    expiresAt: duel.expires_at,
    expired: new Date(duel.expires_at).getTime() < now.getTime(),
    games: duelPlan(duel.id).games,
    creatorName: nameOf(duel.creator_id),
    entries,
    winner,
  };
}

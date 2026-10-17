import { create } from 'zustand';
import { api, type LeagueMember, type LeagueView } from '@/lib/api';
import { backendConfigured } from '@/lib/config';
import { syncNow } from '@/features/sync/sync';

/** Whole days until the league week ends, counting today; at least 1. */
export function leagueDaysLeft(endsAt: string, now = new Date()): number {
  return Math.max(1, Math.ceil((Date.parse(endsAt) - now.getTime()) / 86_400_000));
}

export function myRow(view: LeagueView | null): LeagueMember | null {
  return view?.group?.members.find((m) => m.me) ?? null;
}

interface LeagueState {
  view: LeagueView | null;
  loading: boolean;
  offline: boolean;
  /** Upload pending sessions first so the table includes them, then fetch. */
  refresh(): Promise<void>;
  setOptIn(optIn: boolean): Promise<boolean>;
}

/** Shared by the Home card and the league screen. Online only, not persisted. */
export const useLeague = create<LeagueState>()((set) => ({
  view: null,
  loading: false,
  offline: false,

  async refresh() {
    if (!backendConfigured) return;
    set({ loading: true });
    try {
      await syncNow();
      set({ view: await api.league(), offline: false });
    } catch {
      set({ offline: true });
    } finally {
      set({ loading: false });
    }
  },

  async setOptIn(optIn) {
    set({ loading: true });
    try {
      set({ view: await api.setLeagueOptIn(optIn), offline: false });
      return true;
    } catch {
      set({ offline: true });
      return false;
    } finally {
      set({ loading: false });
    }
  },
}));

import type { DomainRatings, RunSummary, SessionPlan, SessionUpdate } from '@mindtier/core';
import { create } from 'zustand';
import { track } from '@/lib/analytics';
import { useDuels } from './duels';
import { useProgress } from './progress';

export interface ActiveSession {
  plan: SessionPlan;
  /** Ratings when the session began; adaptive games start from these. */
  ratingsAtStart: DomainRatings;
  runs: RunSummary[];
  startedAt: number;
}

export interface FinishedSession {
  plan: SessionPlan;
  runs: RunSummary[];
  result: SessionUpdate;
  ratingsBefore: DomainRatings;
}

interface SessionStore {
  active: ActiveSession | null;
  finished: FinishedSession | null;
  start(plan: SessionPlan): void;
  recordRun(summary: RunSummary): void;
  /** Commit the session to progress. Returns null when nothing was active. */
  finish(): FinishedSession | null;
  abandon(): void;
  clearFinished(): void;
}

/** In-memory only: an interrupted session is simply not counted. */
export const useSession = create<SessionStore>((set, get) => ({
  active: null,
  finished: null,
  start(plan) {
    track('session_started', { mode: plan.mode });
    set({ active: { plan, ratingsAtStart: useProgress.getState().ratings, runs: [], startedAt: Date.now() }, finished: null });
  },
  recordRun(summary) {
    const active = get().active;
    if (!active) return;
    set({ active: { ...active, runs: [...active.runs, summary] } });
  },
  finish() {
    const active = get().active;
    if (!active) return null;
    const result = useProgress.getState().completeSession(active.plan, active.runs);
    const finished: FinishedSession = { plan: active.plan, runs: active.runs, result, ratingsBefore: active.ratingsAtStart };
    set({ active: null, finished });
    if (active.plan.mode === 'duel') {
      const duelId = active.plan.seed.split('|')[1];
      if (duelId) useDuels.getState().recordMyRun(duelId, active.runs.reduce((s, r) => s + r.points, 0));
    }
    track('session_completed', { mode: active.plan.mode, games: active.runs.length });
    // Upload right away when online; the outbox keeps it if not. Lazy import avoids a require cycle.
    void import('@/features/sync/sync').then((m) => m.syncNow());
    return finished;
  },
  abandon() {
    const active = get().active;
    if (active) track('session_abandoned', { mode: active.plan.mode, played: active.runs.length });
    set({ active: null });
  },
  clearFinished() {
    set({ finished: null });
  },
}));

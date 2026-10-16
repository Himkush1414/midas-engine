import type { DomainRatings, RunSummary, SessionPlan, SessionUpdate } from '@mindtier/core';
import { create } from 'zustand';
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
    return finished;
  },
  abandon() {
    set({ active: null });
  },
  clearFinished() {
    set({ finished: null });
  },
}));

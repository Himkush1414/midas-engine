import {
  EMPTY_STREAK,
  applySession,
  currentStreak,
  initialRatings,
  recordActivity,
  toSubmission,
  utcDayKey,
  type Domain,
  type DomainRatings,
  type RunSummary,
  type SessionPlan,
  type SessionUpdate,
  type StreakState,
  type SubmittedRun,
  type UsageToday,
} from '@mindtier/core';
import * as Crypto from 'expo-crypto';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { persistStorage } from '@/lib/storage';

export interface RatingPoint {
  /** Epoch ms */
  at: number;
  domain: Domain;
  rating: number;
  rd: number;
}

export interface DailyRecord {
  points: number;
  /** Per-game accuracy 0..1, for the share grid. */
  accuracy: number[];
  completedAt: number;
}

/** A finished session waiting to be uploaded. */
export interface OutboxItem {
  id: string;
  createdAt: number;
  plan: SessionPlan;
  sessionIndex: number | null;
  runs: SubmittedRun[];
  attempts: number;
}

export interface ProgressState {
  /** Stable per-install seed for ranked plans; registered with the server profile. */
  userSeed: string;
  placementDone: boolean;
  ratings: DomainRatings;
  history: RatingPoint[];
  rankedSessionIndex: number;
  usageDay: string;
  usage: UsageToday;
  streak: StreakState;
  daily: Record<string, DailyRecord>;
  gamesPlayed: number;
  outbox: OutboxItem[];

  /** Record a finished session locally (offline-first). Returns the rating changes. */
  completeSession(plan: SessionPlan, runs: RunSummary[], now?: Date): SessionUpdate;
  usageToday(now?: Date): UsageToday;
  noteDuelCreated(now?: Date): void;
  /** Replace local ratings with the authoritative server copy. */
  adoptServerRatings(ratings: DomainRatings): void;
  dropOutboxItem(id: string): void;
  bumpOutboxAttempt(id: string): void;
  displayStreak(now?: Date): StreakState;
  resetAll(): void;
}

const HISTORY_CAP = 2000;
const emptyUsage: UsageToday = { rankedSessions: 0, duelsCreated: 0 };

function fresh() {
  return {
    userSeed: Crypto.randomUUID(),
    placementDone: false,
    ratings: initialRatings(),
    history: [] as RatingPoint[],
    rankedSessionIndex: 0,
    usageDay: '',
    usage: emptyUsage,
    streak: EMPTY_STREAK,
    daily: {} as Record<string, DailyRecord>,
    gamesPlayed: 0,
    outbox: [] as OutboxItem[],
  };
}

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      ...fresh(),

      completeSession(plan, runs, now = new Date()) {
        const state = get();
        const day = utcDayKey(now);
        const result = applySession(state.ratings, runs);
        const points: RatingPoint[] = result.updates
          .filter((u) => u.delta !== 0 || u.before.rd !== u.after.rd)
          .map((u) => ({ at: now.getTime(), domain: u.domain, rating: u.after.rating, rd: u.after.rd }));
        const usage = state.usageDay === day ? state.usage : emptyUsage;
        const isRanked = plan.mode === 'ranked';
        const countsForStreak = plan.mode !== 'zen';
        const daily =
          plan.mode === 'daily'
            ? {
                ...state.daily,
                [day]: {
                  points: runs.reduce((s, r) => s + r.points, 0),
                  accuracy: runs.map((r) => r.accuracy),
                  completedAt: now.getTime(),
                },
              }
            : state.daily;
        const outboxItem: OutboxItem | null =
          plan.mode === 'zen'
            ? null
            : {
                id: Crypto.randomUUID(),
                createdAt: now.getTime(),
                plan,
                sessionIndex: isRanked ? state.rankedSessionIndex : null,
                runs: runs.map(toSubmission),
                attempts: 0,
              };
        set({
          ratings: result.ratings,
          history: [...state.history, ...points].slice(-HISTORY_CAP),
          placementDone: state.placementDone || plan.mode === 'placement',
          rankedSessionIndex: isRanked ? state.rankedSessionIndex + 1 : state.rankedSessionIndex,
          usageDay: day,
          usage: isRanked ? { ...usage, rankedSessions: usage.rankedSessions + 1 } : usage,
          streak: countsForStreak ? recordActivity(state.streak, day) : state.streak,
          daily,
          gamesPlayed: state.gamesPlayed + runs.length,
          outbox: outboxItem ? [...state.outbox, outboxItem] : state.outbox,
        });
        return result;
      },

      usageToday(now = new Date()) {
        const s = get();
        return s.usageDay === utcDayKey(now) ? s.usage : emptyUsage;
      },

      noteDuelCreated(now = new Date()) {
        const day = utcDayKey(now);
        const usage = get().usageToday(now);
        set({ usageDay: day, usage: { ...usage, duelsCreated: usage.duelsCreated + 1 } });
      },

      adoptServerRatings(ratings) {
        set({ ratings });
      },

      dropOutboxItem(id) {
        set((s) => ({ outbox: s.outbox.filter((o) => o.id !== id) }));
      },

      bumpOutboxAttempt(id) {
        set((s) => ({ outbox: s.outbox.map((o) => (o.id === id ? { ...o, attempts: o.attempts + 1 } : o)) }));
      },

      displayStreak(now = new Date()) {
        return currentStreak(get().streak, utcDayKey(now));
      },

      resetAll() {
        set(fresh());
      },
    }),
    { name: 'mindtier.progress.v1', storage: persistStorage, version: 1 },
  ),
);

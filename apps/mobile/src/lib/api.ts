import type { DomainRatings, SessionPlan, SubmittedRun } from '@mindtier/core';
import { config } from './config';
import { accessToken } from './supabase';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
  /** Requests that will never succeed on retry (validation, conflicts, closed challenges, quota). */
  get permanent(): boolean {
    return this.status >= 400 && this.status < 500 && this.status !== 401 && this.status !== 408 && this.status !== 429;
  }
}

const TIMEOUT_MS = 15_000;

async function request<T>(path: string, init: RequestInit & { auth?: boolean } = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (init.auth !== false) {
    const token = await accessToken();
    if (!token) throw new ApiError(401, 'not signed in');
    headers.Authorization = `Bearer ${token}`;
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${config.apiUrl}${path}`, { ...init, headers: { ...headers, ...(init.headers as object) }, signal: controller.signal });
    const body = (await res.json().catch(() => ({}))) as T & { error?: string };
    if (!res.ok) throw new ApiError(res.status, body.error ?? `HTTP ${res.status}`);
    return body;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError(0, e instanceof Error ? e.message : 'network error');
  } finally {
    clearTimeout(timer);
  }
}

export interface BootstrapResponse {
  profile: { id: string; seed: string; displayName: string | null };
  ratings: DomainRatings;
  isPro: boolean;
  usage: { rankedSessions: number; duelsCreated: number };
  nextSessionIndex: number;
  placementDone: boolean;
  /** Season the returned ratings belong to. Missing from servers older than seasons. */
  season?: number;
}

export interface SessionResponse {
  status: 'ok' | 'duplicate';
  ratings: DomainRatings;
  points?: number;
}

export interface BoardEntry {
  place: number;
  name: string;
  points: number;
  me: boolean;
}

export interface DailyBoard {
  day: string;
  total: number;
  top: BoardEntry[];
  me: { place: number; points: number; total: number; percentile: number | null } | null;
}

export interface DuelInfo {
  id: string;
  createdAt: string;
  expiresAt: string;
  expired: boolean;
  games: string[];
  creatorName: string;
  entries: { name: string; points: number; accuracy: number[]; isCreator: boolean; isMe: boolean }[];
  winner: 'creator' | 'challenger' | 'draw' | null;
}

export const api = {
  bootstrap: (seed: string) => request<BootstrapResponse>('/api/v1/bootstrap', { method: 'POST', body: JSON.stringify({ seed }) }),

  submitSession: (input: { id: string; plan: SessionPlan; sessionIndex: number | null; runs: SubmittedRun[] }) =>
    request<SessionResponse>('/api/v1/sessions', {
      method: 'POST',
      body: JSON.stringify({
        id: input.id,
        mode: input.plan.mode,
        seed: input.plan.seed,
        games: input.plan.games,
        sessionIndex: input.sessionIndex,
        runs: input.runs,
      }),
    }),

  dailyBoard: (day: string) => request<DailyBoard>(`/api/v1/daily/${day}`),

  createDuel: () => request<{ id: string; url: string; expiresAt: string; games: string[] }>('/api/v1/duels', { method: 'POST' }),

  duel: (id: string) => request<DuelInfo>(`/api/v1/duels/${encodeURIComponent(id)}`),

  rename: (displayName: string) =>
    request<{ displayName: string }>('/api/v1/account', { method: 'PATCH', body: JSON.stringify({ displayName }) }),

  deleteAccount: () => request<{ deleted: boolean }>('/api/v1/account', { method: 'DELETE' }),

  registerPushToken: (token: string, platform: 'android' | 'ios') =>
    request<{ registered: boolean }>('/api/v1/push-tokens', { method: 'POST', body: JSON.stringify({ token, platform }) }),

  sendEvents: (events: unknown[]) => request<{ accepted: number }>('/api/v1/events', { method: 'POST', body: JSON.stringify({ events }) }),
};

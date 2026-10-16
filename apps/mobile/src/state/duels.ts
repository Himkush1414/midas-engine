import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { persistStorage } from '@/lib/storage';

export interface LocalDuel {
  id: string;
  role: 'creator' | 'challenger';
  createdAt: number;
  expiresAt: string | null;
  /** Points of my run once played. */
  myPoints: number | null;
  /** Last known opponent result, refreshed from the server. */
  opponent: { name: string; points: number } | null;
}

interface DuelsState {
  duels: LocalDuel[];
  upsert(duel: Partial<LocalDuel> & Pick<LocalDuel, 'id'>): void;
  recordMyRun(id: string, points: number): void;
  remove(id: string): void;
  reset(): void;
}

const MAX_DUELS = 50;

export const DUEL_CODE = /^[a-z0-9]{8}$/;

export function normaliseDuelCode(input: string): string | null {
  // Accept a bare code, an upper-cased code or a full invite link.
  const match = /([a-z0-9]{8})\/?$/i.exec(input.trim());
  const code = match?.[1]?.toLowerCase() ?? '';
  return DUEL_CODE.test(code) ? code : null;
}

export const useDuels = create<DuelsState>()(
  persist(
    (set) => ({
      duels: [],
      upsert: (duel) =>
        set((s) => {
          const existing = s.duels.find((d) => d.id === duel.id);
          const merged: LocalDuel = {
            role: 'challenger',
            createdAt: Date.now(),
            expiresAt: null,
            myPoints: null,
            opponent: null,
            ...existing,
            ...duel,
          };
          const others = s.duels.filter((d) => d.id !== duel.id);
          return { duels: [merged, ...others].slice(0, MAX_DUELS) };
        }),
      recordMyRun: (id, points) => set((s) => ({ duels: s.duels.map((d) => (d.id === id ? { ...d, myPoints: points } : d)) })),
      remove: (id) => set((s) => ({ duels: s.duels.filter((d) => d.id !== id) })),
      reset: () => set({ duels: [] }),
    }),
    { name: 'mindtier.duels.v1', storage: persistStorage, version: 1 },
  ),
);

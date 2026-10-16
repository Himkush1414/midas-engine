import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { persistStorage } from '@/lib/storage';

interface AccountState {
  displayName: string | null;
  /** Email the progress is saved to, once verified. Null for anonymous accounts. */
  email: string | null;
  userId: string | null;
  setDisplayName(name: string | null): void;
  setIdentity(input: { userId: string | null; email: string | null }): void;
  reset(): void;
}

export const useAccount = create<AccountState>()(
  persist(
    (set) => ({
      displayName: null,
      email: null,
      userId: null,
      setDisplayName: (displayName) => set({ displayName }),
      setIdentity: ({ userId, email }) => set({ userId, email }),
      reset: () => set({ displayName: null, email: null, userId: null }),
    }),
    { name: 'mindtier.account.v1', storage: persistStorage, version: 1 },
  ),
);

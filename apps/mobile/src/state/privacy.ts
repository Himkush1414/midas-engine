import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { persistStorage } from '@/lib/storage';

interface PrivacyState {
  /** Stop recording anonymous usage events. */
  analyticsOptOut: boolean;
  /** Stop sending crash reports. */
  crashReportsOptOut: boolean;
  setAnalyticsOptOut(v: boolean): void;
  setCrashReportsOptOut(v: boolean): void;
}

export const usePrivacy = create<PrivacyState>()(
  persist(
    (set) => ({
      analyticsOptOut: false,
      crashReportsOptOut: false,
      setAnalyticsOptOut: (analyticsOptOut) => set({ analyticsOptOut }),
      setCrashReportsOptOut: (crashReportsOptOut) => set({ crashReportsOptOut }),
    }),
    { name: 'mindtier.privacy.v1', storage: persistStorage, version: 1 },
  ),
);

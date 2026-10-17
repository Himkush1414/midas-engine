import type { GameId } from '@mindtier/core';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { persistStorage } from '@/lib/storage';
import type { LanguagePreference } from '@/i18n/core';
import type { ThemePreference } from '@/theme';

export type MotionPreference = 'system' | 'reduced' | 'full';

export interface SettingsState {
  theme: ThemePreference;
  language: LanguagePreference;
  sound: boolean;
  haptics: boolean;
  motion: MotionPreference;
  /** Render colour-based games with shapes instead of colours. */
  shapeMode: boolean;
  reminderEnabled: boolean;
  reminderHour: number;
  reminderMinute: number;
  /** Sunday-evening recap of weeks the player played (needs notification permission). */
  weeklyRecap: boolean;
  /** Games excluded from ranked rotation. */
  hiddenGames: GameId[];
  setTheme(theme: ThemePreference): void;
  setLanguage(language: LanguagePreference): void;
  setSound(on: boolean): void;
  setHaptics(on: boolean): void;
  setMotion(motion: MotionPreference): void;
  setShapeMode(on: boolean): void;
  setReminder(enabled: boolean, hour?: number, minute?: number): void;
  setWeeklyRecap(on: boolean): void;
  toggleHiddenGame(game: GameId): void;
  reset(): void;
}

const defaults = {
  theme: 'system' as ThemePreference,
  language: 'system' as LanguagePreference,
  sound: true,
  haptics: true,
  motion: 'system' as MotionPreference,
  shapeMode: false,
  reminderEnabled: false,
  reminderHour: 19,
  reminderMinute: 0,
  weeklyRecap: true,
  hiddenGames: [] as GameId[],
};

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaults,
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setSound: (sound) => set({ sound }),
      setHaptics: (haptics) => set({ haptics }),
      setMotion: (motion) => set({ motion }),
      setShapeMode: (shapeMode) => set({ shapeMode }),
      setReminder: (reminderEnabled, hour, minute) =>
        set((s) => ({
          reminderEnabled,
          reminderHour: hour ?? s.reminderHour,
          reminderMinute: minute ?? s.reminderMinute,
        })),
      setWeeklyRecap: (weeklyRecap) => set({ weeklyRecap }),
      toggleHiddenGame: (game) =>
        set((s) => ({
          hiddenGames: s.hiddenGames.includes(game) ? s.hiddenGames.filter((g) => g !== game) : [...s.hiddenGames, game],
        })),
      reset: () => set(defaults),
    }),
    { name: 'mindtier.settings.v1', storage: persistStorage, version: 1 },
  ),
);

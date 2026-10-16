import type { GameId } from '@mindtier/core';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { persistStorage } from '@/lib/storage';
import type { ThemePreference } from '@/theme';

export type MotionPreference = 'system' | 'reduced' | 'full';

export interface SettingsState {
  theme: ThemePreference;
  sound: boolean;
  haptics: boolean;
  motion: MotionPreference;
  /** Render colour-based games with shapes instead of colours. */
  shapeMode: boolean;
  reminderEnabled: boolean;
  reminderHour: number;
  reminderMinute: number;
  /** Games excluded from ranked rotation. */
  hiddenGames: GameId[];
  setTheme(theme: ThemePreference): void;
  setSound(on: boolean): void;
  setHaptics(on: boolean): void;
  setMotion(motion: MotionPreference): void;
  setShapeMode(on: boolean): void;
  setReminder(enabled: boolean, hour?: number, minute?: number): void;
  toggleHiddenGame(game: GameId): void;
  reset(): void;
}

const defaults = {
  theme: 'system' as ThemePreference,
  sound: true,
  haptics: true,
  motion: 'system' as MotionPreference,
  shapeMode: false,
  reminderEnabled: false,
  reminderHour: 19,
  reminderMinute: 0,
  hiddenGames: [] as GameId[],
};

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaults,
      setTheme: (theme) => set({ theme }),
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
      toggleHiddenGame: (game) =>
        set((s) => ({
          hiddenGames: s.hiddenGames.includes(game) ? s.hiddenGames.filter((g) => g !== game) : [...s.hiddenGames, game],
        })),
      reset: () => set(defaults),
    }),
    { name: 'mindtier.settings.v1', storage: persistStorage, version: 1 },
  ),
);

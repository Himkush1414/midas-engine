/* global jest */
// In-memory replacement for the SQLite key-value store.
jest.mock('expo-sqlite/kv-store', () => {
  const map = new Map();
  return {
    __esModule: true,
    default: {
      getItemSync: (k) => (map.has(k) ? map.get(k) : null),
      setItemSync: (k, v) => void map.set(k, v),
      removeItemSync: (k) => map.delete(k),
      clearSync: () => {
        map.clear();
        return true;
      },
    },
  };
});

let mockUuidCounter = 0;
jest.mock('expo-crypto', () => ({
  randomUUID: () => `00000000-0000-4000-8000-${String(++mockUuidCounter).padStart(12, '0')}`,
}));

jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn(),
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));

// Reanimated 4 / Worklets: use the official JS mocks in tests.
jest.mock('react-native-worklets', () => require('react-native-worklets/src/mock'));
jest.mock('react-native-reanimated', () => {
  const mock = require('react-native-reanimated/mock');
  return { ...mock, useReducedMotion: () => false };
});

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(async () => null),
  getPermissionsAsync: jest.fn(async () => ({ granted: true, canAskAgain: true })),
  requestPermissionsAsync: jest.fn(async () => ({ granted: true, canAskAgain: true })),
  scheduleNotificationAsync: jest.fn(async () => 'notif-id'),
  cancelScheduledNotificationAsync: jest.fn(async () => undefined),
  cancelAllScheduledNotificationsAsync: jest.fn(async () => undefined),
  AndroidImportance: { DEFAULT: 3, HIGH: 4 },
  SchedulableTriggerInputTypes: { DAILY: 'daily', DATE: 'date' },
}));

jest.mock('@sentry/react-native', () => ({ init: jest.fn(), captureException: jest.fn(), wrap: (c) => c }));

jest.mock('expo-audio', () => ({
  setAudioModeAsync: jest.fn(async () => undefined),
  createAudioPlayer: jest.fn(() => ({ volume: 1, seekTo: jest.fn(async () => undefined), play: jest.fn(), remove: jest.fn() })),
}));

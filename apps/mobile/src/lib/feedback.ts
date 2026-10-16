import * as Haptics from 'expo-haptics';
import { useSettings } from '@/state/settings';

/** Haptic vocabulary used across the app. Respects the user's haptics setting. */
export const haptic = {
  tap() {
    if (useSettings.getState().haptics) void Haptics.selectionAsync();
  },
  correct() {
    if (useSettings.getState().haptics) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },
  wrong() {
    if (useSettings.getState().haptics) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  },
  success() {
    if (useSettings.getState().haptics) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },
  heavy() {
    if (useSettings.getState().haptics) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  },
};

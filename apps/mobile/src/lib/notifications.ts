import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { syncStorage } from './storage';

const CHANNEL_REMINDERS = 'reminders';
const CHANNEL_ACCOUNT = 'account';
const KEY_DAILY = 'mindtier.notif.daily';
const KEY_TRIAL = 'mindtier.notif.trial';

/** Gentle copy: invitations, never guilt. */
const REMINDER_LINES = [
  'Your daily ranked session is ready.',
  'Today’s Daily Challenge is live — same puzzles for everyone.',
  'Three quick games. See if your tier moves.',
  'A few minutes of climbing?',
] as const;

let initialised = false;

export function initNotifications(): void {
  if (initialised) return;
  initialised = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
  if (Platform.OS === 'android') {
    void Notifications.setNotificationChannelAsync(CHANNEL_REMINDERS, {
      name: 'Daily reminders',
      description: 'An optional nudge at the time you choose.',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
    void Notifications.setNotificationChannelAsync(CHANNEL_ACCOUNT, {
      name: 'Account and billing',
      description: 'Trial ending and subscription notices.',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
}

export async function ensurePermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const next = await Notifications.requestPermissionsAsync();
  return next.granted;
}

async function cancelStored(key: string): Promise<void> {
  const id = syncStorage.getItem(key) as string | null;
  if (id) {
    await Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined);
    syncStorage.removeItem(key);
  }
}

/** Schedule (or reschedule) the optional daily reminder. Returns false if permission was denied. */
export async function scheduleDailyReminder(hour: number, minute: number): Promise<boolean> {
  if (!(await ensurePermission())) return false;
  await cancelStored(KEY_DAILY);
  const body = REMINDER_LINES[(new Date().getDate() + hour) % REMINDER_LINES.length] ?? REMINDER_LINES[0];
  const id = await Notifications.scheduleNotificationAsync({
    content: { title: 'Mindtier', body },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute, channelId: CHANNEL_REMINDERS },
  });
  syncStorage.setItem(KEY_DAILY, id);
  return true;
}

export async function cancelDailyReminder(): Promise<void> {
  await cancelStored(KEY_DAILY);
}

/** Days before a free trial converts that the reminder fires. */
export const TRIAL_REMINDER_DAYS = 2;

export function trialReminderDate(trialEndsAt: Date, now = new Date()): Date | null {
  const at = new Date(trialEndsAt.getTime() - TRIAL_REMINDER_DAYS * 86_400_000);
  return at.getTime() > now.getTime() + 60_000 ? at : null;
}

/**
 * Remind the player before their trial converts, so the charge is never a
 * surprise. Scheduled locally; Google Play also emails a reminder.
 */
export async function scheduleTrialReminder(trialEndsAt: Date, priceString: string): Promise<void> {
  const at = trialReminderDate(trialEndsAt);
  if (!at || !(await ensurePermission())) return;
  await cancelStored(KEY_TRIAL);
  const day = trialEndsAt.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Your Mindtier Pro trial ends soon',
      body: `It converts to ${priceString} on ${day}. Cancel anytime in Settings → Manage subscription.`,
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at, channelId: CHANNEL_ACCOUNT },
  });
  syncStorage.setItem(KEY_TRIAL, id);
}

export async function cancelAllLocalNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  syncStorage.removeItem(KEY_DAILY);
  syncStorage.removeItem(KEY_TRIAL);
}

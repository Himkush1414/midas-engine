import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { getT, type TKey } from '@/i18n';
import { api } from './api';
import { syncStorage } from './storage';

const CHANNEL_REMINDERS = 'reminders';
const CHANNEL_ACCOUNT = 'account';
const CHANNEL_RECAPS = 'recaps';
const KEY_DAILY = 'mindtier.notif.daily';
const KEY_TRIAL = 'mindtier.notif.trial';
const KEY_WEEKLY = 'mindtier.notif.weekly';

/** Gentle copy: invitations, never guilt. */
const REMINDER_LINES: TKey[] = ['notify.reminder1', 'notify.reminder2', 'notify.reminder3', 'notify.reminder4'];

let initialised = false;

export function initNotifications(): void {
  if (initialised || Platform.OS === 'web') return;
  initialised = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
  setChannels();
}

/** Android channel names are user-visible in system settings, so they follow the app language. */
function setChannels(): void {
  if (Platform.OS === 'android') {
    const t = getT();
    void Notifications.setNotificationChannelAsync(CHANNEL_REMINDERS, {
      name: t('notify.channelReminders'),
      description: t('notify.channelRemindersDesc'),
      importance: Notifications.AndroidImportance.DEFAULT,
    });
    void Notifications.setNotificationChannelAsync('duels', {
      name: t('notify.channelDuels'),
      description: t('notify.channelDuelsDesc'),
      importance: Notifications.AndroidImportance.DEFAULT,
    });
    void Notifications.setNotificationChannelAsync(CHANNEL_RECAPS, {
      name: t('notify.channelRecaps'),
      description: t('notify.channelRecapsDesc'),
      importance: Notifications.AndroidImportance.DEFAULT,
    });
    void Notifications.setNotificationChannelAsync(CHANNEL_ACCOUNT, {
      name: t('notify.channelAccount'),
      description: t('notify.channelAccountDesc'),
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
}

/**
 * Re-apply the current language to everything already handed to the OS: channel
 * names and the scheduled daily reminder (only if it is on; never prompts).
 */
export async function relocalizeNotifications(reminder: { enabled: boolean; hour: number; minute: number }): Promise<void> {
  if (Platform.OS === 'web') return;
  setChannels();
  if (!reminder.enabled) return;
  const { granted } = await Notifications.getPermissionsAsync();
  if (granted) await scheduleDailyReminder(reminder.hour, reminder.minute);
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
  const t = getT();
  const body = t(REMINDER_LINES[(new Date().getDate() + hour) % REMINDER_LINES.length] ?? 'notify.reminder1');
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
  const t = getT();
  const day = trialEndsAt.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: t('notify.trialTitle'),
      body: t('notify.trialBody', { price: priceString, day }),
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at, channelId: CHANNEL_ACCOUNT },
  });
  syncStorage.setItem(KEY_TRIAL, id);
}

export async function cancelAllLocalNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  syncStorage.removeItem(KEY_DAILY);
  syncStorage.removeItem(KEY_TRIAL);
  syncStorage.removeItem(KEY_WEEKLY);
}

/**
 * Put this week's recap in place for Sunday evening, replacing any earlier
 * copy so the text matches the latest session. Pass null to cancel it.
 * Never asks for permission: the recap only goes to players who already
 * allowed notifications.
 */
export async function scheduleWeeklyRecap(recap: { at: Date; summary: string } | null): Promise<void> {
  if (Platform.OS === 'web') return;
  await cancelStored(KEY_WEEKLY);
  if (!recap || recap.at.getTime() <= Date.now() + 60_000) return;
  const { granted } = await Notifications.getPermissionsAsync();
  if (!granted) return;
  const t = getT();
  const id = await Notifications.scheduleNotificationAsync({
    content: { title: t('notify.weeklyTitle'), body: t('notify.weeklyBody', { summary: recap.summary }), data: { url: 'mindtier://week' } },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: recap.at, channelId: CHANNEL_RECAPS },
  });
  syncStorage.setItem(KEY_WEEKLY, id);
}

const KEY_PUSH = 'mindtier.notif.pushToken';

/**
 * Ask (in context, after a duel) to be told when the other player finishes,
 * and register this device's Expo push token. Safe to call repeatedly.
 */
export async function registerForDuelPush(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    if (!(await ensurePermission())) return false;
    const projectId = (Constants.expoConfig?.extra?.eas as { projectId?: string } | undefined)?.projectId;
    const { data: token } = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
    if (syncStorage.getItem(KEY_PUSH) === token) return true;
    await api.registerPushToken(token, Platform.OS === 'ios' ? 'ios' : 'android');
    syncStorage.setItem(KEY_PUSH, token);
    return true;
  } catch (e) {
    // Push needs FCM/APNs credentials on EAS; without them registration fails quietly.
    if (__DEV__) console.warn('push registration failed', e);
    return false;
  }
}

/** Route a tapped notification to its deep link (e.g. mindtier://duel/abcd2345). */
export function notificationPath(data: unknown): string | null {
  const url = (data as { url?: unknown } | null)?.url;
  if (typeof url !== 'string') return null;
  if (url === 'mindtier://week') return '/week?from=notification';
  const m = /^mindtier:\/\/duel\/([a-z0-9]{8})$/.exec(url);
  return m ? `/duel/${m[1]}` : null;
}

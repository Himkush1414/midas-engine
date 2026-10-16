import * as Notifications from 'expo-notifications';
import { scheduleDailyReminder, scheduleTrialReminder, trialReminderDate } from '../notifications';

describe('notifications', () => {
  it('reminds two days before the trial converts', () => {
    const now = new Date('2026-10-16T10:00:00Z');
    const end = new Date('2026-10-23T10:00:00Z');
    expect(trialReminderDate(end, now)?.toISOString()).toBe('2026-10-21T10:00:00.000Z');
  });

  it('skips the reminder when the trial ends too soon', () => {
    const now = new Date('2026-10-16T10:00:00Z');
    expect(trialReminderDate(new Date('2026-10-17T10:00:00Z'), now)).toBeNull();
  });

  it('schedules a daily trigger at the chosen time', async () => {
    await scheduleDailyReminder(19, 30);
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({ trigger: expect.objectContaining({ type: 'daily', hour: 19, minute: 30 }) }),
    );
  });

  it('includes the price in the trial reminder', async () => {
    const end = new Date(Date.now() + 7 * 86_400_000);
    await scheduleTrialReminder(end, '$39.99');
    const call = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls.at(-1)[0];
    expect(call.content.body).toContain('$39.99');
    expect(call.trigger.type).toBe('date');
  });
});

import * as Notifications from 'expo-notifications';
import { localDayKey, useProgress } from '@/state/progress';
import { useSettings } from '@/state/settings';
import { refreshWeeklyRecap } from '../schedule';

const schedule = Notifications.scheduleNotificationAsync as jest.Mock;
const WED = new Date(2026, 9, 14, 12); // local Wednesday

beforeEach(() => {
  schedule.mockClear();
  useProgress.getState().resetAll();
  useSettings.getState().reset();
  jest.useFakeTimers({ now: WED, doNotFake: ['setTimeout', 'setImmediate', 'nextTick'] });
});
afterEach(() => jest.useRealTimers());

describe('refreshWeeklyRecap', () => {
  it('schedules Sunday 18:00 with this week’s summary once the player has played', async () => {
    useProgress.setState({ activity: { [localDayKey(WED)]: { sessions: 2, games: 6 } } });
    await refreshWeeklyRecap(WED);
    const call = schedule.mock.calls.at(-1)[0];
    expect(call.trigger.date).toEqual(new Date(2026, 9, 18, 18));
    expect(call.content.body).toBe('2 sessions. Tap to see your week.');
  });

  it('stays quiet for a week without sessions or when turned off', async () => {
    await refreshWeeklyRecap(WED);
    useProgress.setState({ activity: { [localDayKey(WED)]: { sessions: 1, games: 3 } } });
    useSettings.getState().setWeeklyRecap(false);
    await refreshWeeklyRecap(WED);
    expect(schedule).not.toHaveBeenCalled();
  });
});

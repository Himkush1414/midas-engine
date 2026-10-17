import { getT } from '@/i18n';
import { scheduleWeeklyRecap } from '@/lib/notifications';
import { useProgress } from '@/state/progress';
import { useSettings } from '@/state/settings';
import { weekRange, weekSummary, weeklyRecap, weeklyRecapTime } from './weekly';

/**
 * Keep the Sunday-evening recap in step with what the player has done this
 * week. Weeks without a session get no notification.
 */
export async function refreshWeeklyRecap(now = new Date()): Promise<void> {
  if (!useSettings.getState().weeklyRecap) return scheduleWeeklyRecap(null);
  const { activity, history, daily } = useProgress.getState();
  const recap = weeklyRecap({ activity, history, daily }, weekRange(now));
  if (recap.sessions === 0) return scheduleWeeklyRecap(null);
  return scheduleWeeklyRecap({ at: weeklyRecapTime(now), summary: weekSummary(getT(), recap) });
}

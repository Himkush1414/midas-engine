import { DOMAINS, type Domain } from '@mindtier/core';
import type { TFunction } from '@/i18n';
import { domainLabel } from '@/i18n/labels';
import { localDayKey, type DailyRecord, type DayActivity, type RatingPoint } from '@/state/progress';

/** A player's calendar week: Monday 00:00 to the next Monday 00:00, local time. */
export interface WeekRange {
  start: Date;
  end: Date;
  /** Local day keys, Monday first. */
  days: string[];
}

/** The week containing `now`, or `offset` weeks before (-1) or after it. */
export function weekRange(now: Date, offset = 0): WeekRange {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7) + offset * 7);
  const days: string[] = [];
  for (let i = 0; i < 7; i++) days.push(localDayKey(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)));
  const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 7);
  return { start, end, days };
}

export interface WeeklyRecap {
  range: WeekRange;
  sessions: number;
  games: number;
  /** Which days of the week (Monday first) had a finished session. */
  played: boolean[];
  activeDays: number;
  dailies: number;
  /** Rating change earned in play per domain, rounded; domains that did not move are left out. */
  gains: { domain: Domain; gain: number }[];
  best: { domain: Domain; gain: number } | null;
}

export interface WeeklyInput {
  activity: Record<string, DayActivity>;
  history: readonly RatingPoint[];
  daily: Record<string, DailyRecord>;
}

export function weeklyRecap(input: WeeklyInput, range: WeekRange): WeeklyRecap {
  const from = range.start.getTime();
  const to = range.end.getTime();
  const days = range.days.map((d) => input.activity[d]);
  const played = days.map((d) => (d?.sessions ?? 0) > 0);

  // Sum the change each point made over the one before it. Season resets are
  // skipped: the week's recap shows what was earned in play.
  const totals = new Map<Domain, number>();
  const last = new Map<Domain, number>();
  for (const p of input.history) {
    const prev = last.get(p.domain);
    last.set(p.domain, p.rating);
    if (p.at < from || p.at >= to || p.reason === 'season' || prev === undefined) continue;
    totals.set(p.domain, (totals.get(p.domain) ?? 0) + p.rating - prev);
  }
  const sessions = days.reduce((s, d) => s + (d?.sessions ?? 0), 0);
  // Rating moves without logged sessions predate the activity log (an app
  // update mid-week): leave them out so the recap never says "0 sessions, +117".
  const gains =
    sessions === 0 ? [] : DOMAINS.map((domain) => ({ domain, gain: Math.round(totals.get(domain) ?? 0) })).filter((g) => g.gain !== 0);
  const best = gains.reduce<WeeklyRecap['best']>((b, g) => (g.gain > 0 && (!b || g.gain > b.gain) ? g : b), null);

  return {
    range,
    sessions,
    games: days.reduce((s, d) => s + (d?.games ?? 0), 0),
    played,
    activeDays: played.filter(Boolean).length,
    dailies: Object.values(input.daily).filter((d) => d.completedAt >= from && d.completedAt < to).length,
    gains,
    best,
  };
}

/** When the weekly recap notification for the week of `now` fires: Sunday 18:00 local. */
export function weeklyRecapTime(now: Date): Date {
  const { end } = weekRange(now);
  return new Date(end.getFullYear(), end.getMonth(), end.getDate() - 1, 18, 0, 0, 0);
}

/** One line about a week, e.g. "3 sessions · Memory +32". Shared by the profile card and the notification. */
export function weekSummary(t: TFunction, recap: Pick<WeeklyRecap, 'sessions' | 'best'>): string {
  const parts = [t('week.summary', { count: recap.sessions })];
  if (recap.best) parts.push(t('week.bestShort', { domain: domainLabel(t, recap.best.domain), gain: recap.best.gain }));
  return parts.join(' · ');
}

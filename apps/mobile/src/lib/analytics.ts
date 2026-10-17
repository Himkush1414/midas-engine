import { syncStorage } from './storage';

/**
 * First-party, privacy-first product analytics. Events carry no personal data
 * (no names, emails, device identifiers or advertising IDs), are buffered
 * locally and uploaded in batches to our own API. Nothing is sold or shared.
 */
export type EventName =
  | 'app_opened'
  | 'onboarding_started'
  | 'placement_completed'
  | 'session_started'
  | 'session_completed'
  | 'session_abandoned'
  | 'game_completed'
  | 'paywall_viewed'
  | 'paywall_dismissed'
  | 'purchase_started'
  | 'purchase_completed'
  | 'share_tapped'
  | 'duel_created'
  | 'duel_accepted'
  | 'reminder_enabled'
  | 'account_linked'
  | 'account_deleted'
  | 'season_started'
  | 'season_recap_viewed'
  | 'weekly_recap_viewed'
  | 'league_joined'
  | 'league_left';

export type EventProps = Record<string, string | number | boolean | null>;

export interface QueuedEvent {
  name: EventName;
  props: EventProps;
  at: number;
}

const KEY = 'mindtier.analytics.queue';
const MAX_QUEUE = 500;
let optedOut = false;

export function setAnalyticsOptOut(value: boolean): void {
  optedOut = value;
  if (value) syncStorage.removeItem(KEY);
}

export function readQueue(): QueuedEvent[] {
  try {
    const raw = syncStorage.getItem(KEY) as string | null;
    return raw ? (JSON.parse(raw) as QueuedEvent[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(events: QueuedEvent[]): void {
  syncStorage.setItem(KEY, JSON.stringify(events.slice(-MAX_QUEUE)));
}

export function track(name: EventName, props: EventProps = {}): void {
  if (optedOut) return;
  writeQueue([...readQueue(), { name, props, at: Date.now() }]);
}

/** Upload buffered events with `send`; events are removed only after a successful upload. */
export async function flushAnalytics(send: (events: QueuedEvent[]) => Promise<boolean>): Promise<number> {
  const events = readQueue();
  if (events.length === 0 || optedOut) return 0;
  const batch = events.slice(0, 100);
  const ok = await send(batch).catch(() => false);
  if (!ok) return 0;
  writeQueue(readQueue().slice(batch.length));
  return batch.length;
}

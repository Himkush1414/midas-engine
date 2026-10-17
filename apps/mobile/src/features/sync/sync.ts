import { flushAnalytics } from '@/lib/analytics';
import { ApiError, api } from '@/lib/api';
import { backendConfigured } from '@/lib/config';
import { useAccount } from '@/state/account';
import { useEntitlements } from '@/state/entitlements';
import { useProgress } from '@/state/progress';

export type SyncResult =
  | { status: 'disabled' }
  | { status: 'busy' }
  | { status: 'ok'; uploaded: number; dropped: number; pending: number }
  | { status: 'error'; message: string };

const MAX_ATTEMPTS = 20;
let running: Promise<SyncResult> | null = null;

async function run(): Promise<SyncResult> {
  const progress = useProgress.getState();
  const boot = await api.bootstrap(progress.userSeed);
  useAccount.getState().setDisplayName(boot.profile.displayName);
  useProgress.getState().adoptServerProfile({
    seed: boot.profile.seed,
    nextSessionIndex: boot.nextSessionIndex,
    placementDone: boot.placementDone,
  });

  let latest = boot.ratings;
  let uploaded = 0;
  let dropped = 0;
  for (const item of useProgress.getState().outbox) {
    try {
      const res = await api.submitSession({ id: item.id, plan: item.plan, sessionIndex: item.sessionIndex, runs: item.runs });
      latest = res.ratings;
      useProgress.getState().dropOutboxItem(item.id);
      uploaded++;
    } catch (e) {
      const permanent = e instanceof ApiError && e.permanent;
      if (permanent || item.attempts + 1 >= MAX_ATTEMPTS) {
        // Rejected by the server (e.g. duplicate, closed daily, failed verification): it can never succeed.
        useProgress.getState().dropOutboxItem(item.id);
        dropped++;
        continue;
      }
      useProgress.getState().bumpOutboxAttempt(item.id);
      break; // network or server trouble: keep order, try again later
    }
  }

  const pending = useProgress.getState().outbox.length;
  // Only adopt the server's ratings once nothing local is waiting, so offline progress is never overwritten.
  if (pending === 0) useProgress.getState().adoptServerRatings(latest, boot.season);

  // The store is the source of truth on-device; the server copy (from the RevenueCat webhook) only adds Pro.
  if (boot.isPro && !useEntitlements.getState().isPro) useEntitlements.getState().set({ isPro: true });

  await flushAnalytics(async (events) => {
    await api.sendEvents(events);
    return true;
  });
  return { status: 'ok', uploaded, dropped, pending };
}

/** Upload pending sessions and refresh authoritative state. Safe to call often; concurrent calls share one run. */
export function syncNow(): Promise<SyncResult> {
  if (!backendConfigured) return Promise.resolve({ status: 'disabled' });
  if (running) return running;
  running = run()
    .catch((e: unknown): SyncResult => ({ status: 'error', message: e instanceof Error ? e.message : String(e) }))
    .finally(() => {
      running = null;
    });
  return running;
}

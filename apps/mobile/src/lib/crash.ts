import * as Sentry from '@sentry/react-native';
import { usePrivacy } from '@/state/privacy';
import { config } from './config';

let enabled = false;

/**
 * Crash reporting. Inert until EXPO_PUBLIC_SENTRY_DSN is set; respects the
 * in-app "Send crash reports" switch on every event. No PII is attached.
 */
export function initCrashReporting(): void {
  if (!config.sentryDsn || enabled) return;
  enabled = true;
  Sentry.init({
    dsn: config.sentryDsn,
    sendDefaultPii: false,
    tracesSampleRate: 0.05,
    enableAutoSessionTracking: true,
    beforeSend: (event) => (usePrivacy.getState().crashReportsOptOut ? null : event),
    beforeBreadcrumb: (crumb) => (crumb.category === 'console' ? null : crumb),
  });
}

export function reportError(error: unknown, context?: Record<string, string>): void {
  if (!enabled) {
    if (__DEV__) console.error(error);
    return;
  }
  Sentry.captureException(error, context ? { tags: context } : undefined);
}

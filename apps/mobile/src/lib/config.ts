import { WEB_URL } from './links';

/**
 * Public runtime configuration, inlined at build time from EXPO_PUBLIC_* variables
 * (set as EAS environment variables for builds, or apps/mobile/.env.local locally).
 * Nothing here is secret: the anon key only works within row-level security.
 */
export const config = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  apiUrl: (process.env.EXPO_PUBLIC_API_URL ?? WEB_URL).replace(/\/$/, ''),
  sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN ?? '',
} as const;

/** False in builds without backend config: the app then runs fully offline. */
export const backendConfigured = Boolean(config.supabaseUrl && config.supabaseAnonKey);

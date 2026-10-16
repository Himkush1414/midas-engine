import 'react-native-url-polyfill/auto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { kv } from './kv';
import { AppState } from 'react-native';
import { backendConfigured, config } from './config';

let client: SupabaseClient | null = null;

/** Auth/session client. Data writes go through our API, which verifies every game. */
export function supabase(): SupabaseClient | null {
  if (!backendConfigured) return null;
  if (!client) {
    client = createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: {
        storage: {
          getItem: (k) => kv.getItemAsync(k),
          setItem: (k, v) => kv.setItemAsync(k, v),
          removeItem: (k) => kv.removeItemAsync(k),
        },
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
    // Refresh tokens only while the app is in the foreground.
    AppState.addEventListener('change', (state) => {
      if (state === 'active') void client?.auth.startAutoRefresh();
      else void client?.auth.stopAutoRefresh();
    });
  }
  return client;
}

/** Current access token, signing in anonymously on first use. Null when offline or unconfigured. */
export async function accessToken(): Promise<string | null> {
  const sb = supabase();
  if (!sb) return null;
  const { data } = await sb.auth.getSession();
  if (data.session) return data.session.access_token;
  const { data: signedIn, error } = await sb.auth.signInAnonymously();
  if (error) return null;
  return signedIn.session?.access_token ?? null;
}

export async function currentUserId(): Promise<string | null> {
  const sb = supabase();
  if (!sb) return null;
  const { data } = await sb.auth.getSession();
  return data.session?.user.id ?? null;
}

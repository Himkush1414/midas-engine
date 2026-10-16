import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let admin: SupabaseClient | null = null;

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing server environment variable ${name}`);
  return v;
}

/** Service-role client. Bypasses RLS — only ever used on the server. */
export function supabaseAdmin(): SupabaseClient {
  if (!admin) {
    admin = createClient(required('SUPABASE_URL'), required('SUPABASE_SERVICE_ROLE_KEY'), {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return admin;
}

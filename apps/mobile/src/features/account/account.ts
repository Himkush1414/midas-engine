import { syncNow } from '@/features/sync/sync';
import { getT } from '@/i18n';
import { track } from '@/lib/analytics';
import { api } from '@/lib/api';
import { cancelAllLocalNotifications } from '@/lib/notifications';
import { clearAllStorage } from '@/lib/storage';
import { supabase } from '@/lib/supabase';
import { useAccount } from '@/state/account';
import { useDuels } from '@/state/duels';
import { useEntitlements } from '@/state/entitlements';
import { useProgress } from '@/state/progress';
import { useSettings } from '@/state/settings';

export type AccountResult = { ok: true } | { ok: false; message: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const isValidEmail = (e: string) => EMAIL.test(e.trim()) && e.trim().length <= 254;
export const isValidCode = (c: string) => /^\d{6}$/.test(c.trim());

function client() {
  const sb = supabase();
  if (!sb) throw new Error(getT()('account.errUnavailable'));
  return sb;
}

const friendly = (message: string | undefined): string => {
  const t = getT();
  if (!message) return t('account.errGeneric');
  if (/rate|too many|seconds/i.test(message)) return t('account.errRate');
  if (/expired|invalid|token/i.test(message)) return t('account.errCode');
  if (/already|registered|exists/i.test(message)) return t('account.errExists');
  return message;
};

/** Step 1 of saving progress: attach an email to the current (anonymous) account. */
export async function requestLinkCode(email: string): Promise<AccountResult> {
  try {
    const { error } = await client().auth.updateUser({ email: email.trim().toLowerCase() });
    return error ? { ok: false, message: friendly(error.message) } : { ok: true };
  } catch (e) {
    return { ok: false, message: friendly((e as Error).message) };
  }
}

/** Step 2: confirm the code. The account id doesn't change, so nothing is lost. */
export async function confirmLinkCode(email: string, code: string): Promise<AccountResult> {
  try {
    const { data, error } = await client().auth.verifyOtp({ email: email.trim().toLowerCase(), token: code.trim(), type: 'email_change' });
    if (error) return { ok: false, message: friendly(error.message) };
    useAccount.getState().setIdentity({ userId: data.user?.id ?? null, email: data.user?.email ?? email });
    track('account_linked');
    return { ok: true };
  } catch (e) {
    return { ok: false, message: friendly((e as Error).message) };
  }
}

/** Sign in to an existing account on this device (e.g. a new phone). */
export async function requestSignInCode(email: string): Promise<AccountResult> {
  try {
    const { error } = await client().auth.signInWithOtp({ email: email.trim().toLowerCase(), options: { shouldCreateUser: false } });
    return error ? { ok: false, message: friendly(error.message) } : { ok: true };
  } catch (e) {
    return { ok: false, message: friendly((e as Error).message) };
  }
}

export async function confirmSignInCode(email: string, code: string): Promise<AccountResult> {
  try {
    const { data, error } = await client().auth.verifyOtp({ email: email.trim().toLowerCase(), token: code.trim(), type: 'email' });
    if (error) return { ok: false, message: friendly(error.message) };
    // This device now belongs to the signed-in account: start clean, then pull its state.
    useProgress.getState().resetAll();
    useDuels.getState().reset();
    useAccount.getState().setIdentity({ userId: data.user?.id ?? null, email: data.user?.email ?? email });
    await syncNow();
    return { ok: true };
  } catch (e) {
    return { ok: false, message: friendly((e as Error).message) };
  }
}

function wipeLocal(): void {
  useProgress.getState().resetAll();
  useDuels.getState().reset();
  useEntitlements.getState().reset();
  useAccount.getState().reset();
  useSettings.getState().reset();
  clearAllStorage();
}

/** Permanently delete the account on the server, then everything on this device. */
export async function deleteAccount(): Promise<AccountResult> {
  try {
    await api.deleteAccount();
  } catch (e) {
    return { ok: false, message: getT()('account.errNetwork') + (__DEV__ ? ` (${(e as Error).message})` : '') };
  }
  track('account_deleted');
  await supabase()?.auth.signOut({ scope: 'local' }).catch(() => undefined);
  await cancelAllLocalNotifications().catch(() => undefined);
  wipeLocal();
  return { ok: true };
}

/** Sign out of a saved account; the device starts again as a new anonymous player. */
export async function signOut(): Promise<void> {
  await supabase()?.auth.signOut({ scope: 'local' }).catch(() => undefined);
  await cancelAllLocalNotifications().catch(() => undefined);
  wipeLocal();
}

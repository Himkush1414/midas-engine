/**
 * Display names are shown to other players (duels, leaderboards), so they are
 * restricted to a safe character set and screened against a small blocklist.
 * Names that look like contact details or links are rejected to prevent spam.
 */
const ALLOWED = /^[\p{L}\p{N}][\p{L}\p{N} _.'-]{0,22}[\p{L}\p{N}]$/u;

// Lower-cased, de-leeted fragments. Kept intentionally short; extend as reports come in.
const BLOCKED = ['fuck', 'shit', 'cunt', 'nigg', 'fag', 'rape', 'nazi', 'hitler', 'whore', 'slut', 'bitch', 'dick', 'porn', 'admin', 'mindtier', 'moderator', 'support'];

const LEET: Record<string, string> = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '@': 'a', $: 's' };

export function normaliseForScreening(name: string): string {
  return name
    .toLowerCase()
    .split('')
    .map((c) => LEET[c] ?? c)
    .join('')
    .replace(/[^\p{L}\p{N}]/gu, '');
}

export type NameCheck = { ok: true; name: string } | { ok: false; reason: string };

export function checkDisplayName(raw: string): NameCheck {
  const name = raw.normalize('NFKC').trim().replace(/\s+/g, ' ');
  if (name.length < 2 || name.length > 24) return { ok: false, reason: 'Names are 2 to 24 characters.' };
  if (!ALLOWED.test(name)) return { ok: false, reason: 'Use letters, numbers, spaces, dots, dashes or underscores.' };
  if (/(https?|www\.|\.com|@)/i.test(name) || /\d{6,}/.test(name)) return { ok: false, reason: 'Names can’t contain links or contact details.' };
  const screened = normaliseForScreening(name);
  if (BLOCKED.some((b) => screened.includes(b))) return { ok: false, reason: 'Please choose a different name.' };
  return { ok: true, name };
}

/**
 * Minimal typed i18n. Dictionaries are nested objects of strings; keys are
 * dotted paths checked at compile time. Plurals use `key_one` / `key_other`
 * (and other Intl plural categories) selected by `params.count`.
 */

export type Dictionary = { readonly [key: string]: string | Dictionary };

/** Same shape as T, with every leaf widened to string (what translations must provide). */
export type Shape<T> = { readonly [K in keyof T]: T[K] extends string ? string : Shape<T[K]> };

type Join<K, P> = K extends string ? (P extends string ? `${K}.${P}` : never) : never;
type StripPlural<K> = K extends `${infer B}_${'zero' | 'one' | 'two' | 'few' | 'many' | 'other'}` ? B : K;

/** All dotted leaf paths of a dictionary, with plural suffixes collapsed. */
export type Path<T> = {
  [K in keyof T & string]: T[K] extends string ? StripPlural<K> : Join<K, Path<T[K]>>;
}[keyof T & string];

export type Params = Record<string, string | number>;

/** Plural category; falls back to one/other where the JS engine lacks Intl.PluralRules. */
export function pluralCategory(locale: string, count: number): string {
  try {
    if (typeof Intl !== 'undefined' && typeof Intl.PluralRules === 'function') return new Intl.PluralRules(locale).select(count);
  } catch {
    // fall through
  }
  return count === 1 ? 'one' : 'other';
}

function lookup(dict: Dictionary, path: string): string | Dictionary | undefined {
  let node: string | Dictionary | undefined = dict;
  for (const part of path.split('.')) {
    if (node === undefined || typeof node === 'string') return undefined;
    node = node[part];
  }
  return node;
}

export function interpolate(template: string, params?: Params, locale?: string): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const v = params[name];
    if (v === undefined) return match;
    return typeof v === 'number' ? v.toLocaleString(locale) : v;
  });
}

/** Translate `path` from `dict`, falling back to `fallback` (English), then to the key itself. */
export function translate(dict: Dictionary, fallback: Dictionary, locale: string, path: string, params?: Params): string {
  const count = params?.count;
  if (typeof count === 'number') {
    const category = pluralCategory(locale, count);
    for (const d of [dict, fallback]) {
      const hit = lookup(d, `${path}_${category}`) ?? lookup(d, `${path}_other`);
      if (typeof hit === 'string') return interpolate(hit, params, locale);
    }
  }
  for (const d of [dict, fallback]) {
    const hit = lookup(d, path);
    if (typeof hit === 'string') return interpolate(hit, params, locale);
  }
  return path;
}

export const LANGUAGES = ['en', 'es', 'pt', 'de', 'fr'] as const;
export type Language = (typeof LANGUAGES)[number];
export type LanguagePreference = 'system' | Language;

export function resolveLanguage(preference: LanguagePreference, deviceLanguage: string | null | undefined): Language {
  if (preference !== 'system') return preference;
  const code = (deviceLanguage ?? 'en').toLowerCase().slice(0, 2);
  return (LANGUAGES as readonly string[]).includes(code) ? (code as Language) : 'en';
}

export const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  es: 'Español',
  pt: 'Português',
  de: 'Deutsch',
  fr: 'Français',
};

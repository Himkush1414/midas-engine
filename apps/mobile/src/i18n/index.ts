import { getLocales } from 'expo-localization';
import { useSettings } from '@/state/settings';
import { resolveLanguage, translate, type Language, type Params, type Path, type Shape } from './core';
import { en, type EnglishDictionary } from './en';
import { es } from './es';
import { pt } from './pt';

export type TKey = Path<EnglishDictionary>;
export type Translations = Shape<EnglishDictionary>;
export type TFunction = (key: TKey, params?: Params) => string;

const DICTIONARIES: Partial<Record<Language, Translations>> = { en, es, pt };

/** Register a translation (kept separate so each language can be lazy-added). */
export function registerLanguage(lang: Language, dict: Translations): void {
  DICTIONARIES[lang] = dict;
}

function deviceLanguage(): string | null {
  try {
    return getLocales()[0]?.languageCode ?? null;
  } catch {
    return null;
  }
}

export function currentLanguage(): Language {
  const lang = resolveLanguage(useSettings.getState().language, deviceLanguage());
  return DICTIONARIES[lang] ? lang : 'en';
}

function makeT(lang: Language): TFunction {
  const dict = DICTIONARIES[lang] ?? en;
  return (key, params) => translate(dict, en, lang, key, params);
}

/** Translate outside React (notifications, share text). */
export function getT(): TFunction {
  return makeT(currentLanguage());
}

/** Translate inside components; re-renders when the language setting changes. */
export function useT(): TFunction {
  const preference = useSettings((s) => s.language);
  const lang = resolveLanguage(preference, deviceLanguage());
  return makeT(DICTIONARIES[lang] ? lang : 'en');
}

export function useLanguage(): Language {
  const preference = useSettings((s) => s.language);
  const lang = resolveLanguage(preference, deviceLanguage());
  return DICTIONARIES[lang] ? lang : 'en';
}

export { LANGUAGES, LANGUAGE_NAMES, type Language, type LanguagePreference } from './core';

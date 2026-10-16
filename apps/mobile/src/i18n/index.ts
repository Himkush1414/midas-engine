import { getLocales, useLocales } from 'expo-localization';
import { useEffect } from 'react';
import { create } from 'zustand';
import { useSettings } from '@/state/settings';
import { resolveLanguage, translate, type Language, type Params, type Path, type Shape } from './core';
import { en, type EnglishDictionary } from './en';
import { de } from './de';
import { es } from './es';
import { fr } from './fr';
import { pt } from './pt';

export type TKey = Path<EnglishDictionary>;
export type Translations = Shape<EnglishDictionary>;
export type TFunction = (key: TKey, params?: Params) => string;

const DICTIONARIES: Partial<Record<Language, Translations>> = { en, es, pt, de, fr };

/** Register a translation (kept separate so each language can be lazy-added). */
export function registerLanguage(lang: Language, dict: Translations): void {
  DICTIONARIES[lang] = dict;
}

function readDeviceLanguage(): string | null {
  try {
    return getLocales()[0]?.languageCode ?? null;
  } catch {
    return null;
  }
}

/** The device language, kept current so a system language change re-renders without an app restart. */
const useDeviceLanguage = create<{ code: string | null }>(() => ({ code: readDeviceLanguage() }));

/** Mount once near the root: follows system (and Android per-app) language changes. */
export function useSyncDeviceLanguage(): void {
  const code = useLocales()[0]?.languageCode ?? null;
  useEffect(() => {
    if (useDeviceLanguage.getState().code !== code) useDeviceLanguage.setState({ code });
  }, [code]);
}

const deviceLanguage = () => useDeviceLanguage.getState().code;

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
  const device = useDeviceLanguage((s) => s.code);
  const lang = resolveLanguage(preference, device);
  return makeT(DICTIONARIES[lang] ? lang : 'en');
}

export function useLanguage(): Language {
  const preference = useSettings((s) => s.language);
  const device = useDeviceLanguage((s) => s.code);
  const lang = resolveLanguage(preference, device);
  return DICTIONARIES[lang] ? lang : 'en';
}

export { LANGUAGES, LANGUAGE_NAMES, type Language, type LanguagePreference } from './core';

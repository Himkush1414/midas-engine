import type { WordCategory, WordId } from '@mindtier/core';
import type { Language } from '@/i18n';
import { de } from './de';
import { en } from './en';
import { es } from './es';
import { fr } from './fr';
import { it } from './it';
import { pt } from './pt';
import type { WordContent } from './types';

export const WORD_CONTENT: Record<Language, WordContent> = { en, es, pt, de, fr, it };

/** Words are shown in capitals, with each language's own rules (German ß becomes SS). */
export function wordLabel(language: Language, id: WordId): string {
  return (WORD_CONTENT[language] ?? en).words[id].toLocaleUpperCase(language);
}

export function categoryLabel(language: Language, id: WordCategory): string {
  return (WORD_CONTENT[language] ?? en).categories[id];
}

export type { WordContent };

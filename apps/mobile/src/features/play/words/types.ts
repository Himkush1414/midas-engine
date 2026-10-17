import type { WordCategory, WordId } from '@mindtier/core';

/** One language's words for the Language games: every category label and every concept. */
export interface WordContent {
  categories: Record<WordCategory, string>;
  words: Record<WordId, string>;
}

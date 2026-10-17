import type { GameDefinition } from './types';
import { binary, isInt, lerpByLevel } from './util';
import { WORD_CATEGORIES, WORD_CATEGORY_IDS, distantCategories, siblingsOf, type WordCategory, type WordId } from './words';

/**
 * Odd one out: all words but one share a category. Levels add words and draw
 * the odd one from ever closer categories (a carrot among fruit rather than a
 * hammer), with less time.
 */
export interface MisfitTrial {
  /** The category most words share. */
  category: WordCategory;
  words: WordId[];
  oddIndex: number;
}

/** Index of the word that does not belong. */
export type MisfitResponse = number;

const MAX_LEVEL = 14;

export function wordCountFor(level: number): number {
  if (level <= 4) return 4;
  if (level <= 9) return 5;
  return 6;
}

export const misfit: GameDefinition<MisfitTrial, MisfitResponse> = {
  id: 'misfit',
  domain: 'language',
  name: 'Misfit',
  rules: 'All the words but one belong together. Tap the one that doesn’t.',
  maxLevel: MAX_LEVEL,
  trialCount: 10,
  // One in four to one in six by level.
  chance: 0.2,
  minHumanRtMs: 400,

  generate(rng, level) {
    const count = wordCountFor(level);
    const category = rng.pick(WORD_CATEGORY_IDS);
    const siblings = siblingsOf(category);
    const close = siblings.length > 0 && rng.chance(lerpByLevel(level, MAX_LEVEL, 0, 0.9));
    const oddCategory = rng.pick(close ? siblings : distantCategories(category));
    const members = rng.shuffle(WORD_CATEGORIES[category] as readonly WordId[]).slice(0, count - 1);
    const odd = rng.pick(WORD_CATEGORIES[oddCategory] as readonly WordId[]);
    const oddIndex = rng.int(0, count - 1);
    const words = [...members];
    words.splice(oddIndex, 0, odd);
    return { category, words, oddIndex };
  },

  evaluate: (trial, response) => binary(response === trial.oddIndex),

  solve: (trial) => trial.oddIndex,

  timeLimitMs: (level) => Math.round(lerpByLevel(level, MAX_LEVEL, 9000, 3500)),

  isResponse: (value): value is MisfitResponse => isInt(value) && value >= 0 && value < 6,
};

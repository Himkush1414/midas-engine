import type { Rng } from '../random';
import type { GameDefinition } from './types';
import { binary, lerpByLevel } from './util';
import { WORD_CATEGORIES, WORD_CATEGORY_IDS, distantCategories, siblingsOf, type WordCategory, type WordId } from './words';

/**
 * Category verification: a category and a word appear; does the word belong?
 * Low levels lure with words from unrelated groups (a hammer among birds);
 * high levels lure with close relatives (a trout among birds) and less time.
 */
export interface SortTrial {
  category: WordCategory;
  word: WordId;
}

/** True when the word belongs to the category. */
export type SortResponse = boolean;

const MAX_LEVEL = 14;

export function sortAnswer(trial: SortTrial): boolean {
  return (WORD_CATEGORIES[trial.category] as readonly WordId[]).includes(trial.word);
}

/** Share of lures taken from a sibling category at this level. */
export function closeLureShare(level: number): number {
  return lerpByLevel(level, MAX_LEVEL, 0, 0.9);
}

/** A word from another category: a close relative or an unrelated group, per level. */
export function sortLureFor(rng: Rng, category: WordCategory, level: number): WordId {
  const siblings = siblingsOf(category);
  const pool = siblings.length > 0 && rng.chance(closeLureShare(level)) ? siblings : distantCategories(category);
  return rng.pick(WORD_CATEGORIES[rng.pick(pool)] as readonly WordId[]);
}

export const sort: GameDefinition<SortTrial, SortResponse> = {
  id: 'sort',
  domain: 'language',
  name: 'Sort',
  rules: 'A group and a word appear. Does the word belong to the group? Answer before time runs out.',
  maxLevel: MAX_LEVEL,
  trialCount: 16,
  chance: 0.5,
  minHumanRtMs: 300,

  generate(rng, level) {
    const category = rng.pick(WORD_CATEGORY_IDS);
    const word = rng.chance(0.5) ? rng.pick(WORD_CATEGORIES[category] as readonly WordId[]) : sortLureFor(rng, category, level);
    return { category, word };
  },

  evaluate: (trial, response) => binary(response !== null && response === sortAnswer(trial)),

  solve: sortAnswer,

  timeLimitMs: (level) => Math.round(lerpByLevel(level, MAX_LEVEL, 4000, 1300)),

  isResponse: (value): value is SortResponse => typeof value === 'boolean',
};

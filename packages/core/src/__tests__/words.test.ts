import { describe, expect, it } from 'vitest';
import { ALL_WORD_IDS, WORD_CATEGORIES, WORD_CATEGORY_IDS, WORD_GROUPS, categoryOf, distantCategories, siblingsOf } from '../games/words';

describe('word taxonomy', () => {
  it('puts every concept in exactly one category', () => {
    const all = WORD_CATEGORY_IDS.flatMap((c) => WORD_CATEGORIES[c] as readonly string[]);
    expect(new Set(all).size).toBe(all.length);
    expect(ALL_WORD_IDS).toHaveLength(all.length);
  });

  it('has enough words in every category for six-word puzzles', () => {
    for (const c of WORD_CATEGORY_IDS) expect(WORD_CATEGORIES[c].length).toBeGreaterThanOrEqual(8);
  });

  it('places every category in exactly one group', () => {
    const grouped = Object.values(WORD_GROUPS).flat();
    expect([...grouped].sort()).toEqual([...WORD_CATEGORY_IDS].sort());
  });

  it('knows siblings, distant categories and where each word belongs', () => {
    expect(siblingsOf('birds').sort()).toEqual(['fish', 'insects', 'mammals']);
    expect(siblingsOf('vehicles')).toEqual([]);
    expect(distantCategories('fruit')).not.toContain('vegetables');
    expect(distantCategories('fruit')).toContain('tools');
    expect(categoryOf('owl')).toBe('birds');
    expect(categoryOf('frying-pan')).toBe('kitchenware');
  });
});

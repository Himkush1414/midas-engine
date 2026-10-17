import { ALL_WORD_IDS, WORD_CATEGORY_IDS, categoryOf } from '@mindtier/core';
import { LANGUAGES } from '@/i18n';
import { WORD_CONTENT, wordLabel } from '../index';

describe.each(LANGUAGES)('%s words', (lang) => {
  const content = WORD_CONTENT[lang];

  it('names every category and every concept, with nothing empty', () => {
    expect(Object.keys(content.categories).sort()).toEqual([...WORD_CATEGORY_IDS].sort());
    expect(Object.keys(content.words).sort()).toEqual([...ALL_WORD_IDS].sort());
    for (const v of [...Object.values(content.categories), ...Object.values(content.words)]) expect(v.trim()).not.toBe('');
  });

  it('never shows the same word for two concepts', () => {
    const seen = new Map<string, string>();
    for (const id of ALL_WORD_IDS) {
      const shown = wordLabel(lang, id);
      expect({ shown, clash: seen.get(shown) ?? null }).toEqual({ shown, clash: null });
      seen.set(shown, id);
    }
  });

  it('never uses a category name as a word', () => {
    const names = new Set(Object.values(content.categories).map((c) => c.toLocaleUpperCase(lang)));
    for (const id of ALL_WORD_IDS) expect({ id, clash: names.has(wordLabel(lang, id)) }).toEqual({ id, clash: false });
  });
});

it('shows words in capitals with language rules', () => {
  expect(wordLabel('de', 'football')).toBe('FUSSBALL');
  expect(wordLabel('fr', 'eye')).toBe('ŒIL');
  expect(categoryOf('handball')).toBe('sports');
});

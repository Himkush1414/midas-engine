import { LANGUAGES, type Dictionary } from '../core';
import { de } from '../de';
import { en } from '../en';
import { es } from '../es';
import { fr } from '../fr';
import { it as italian } from '../it';
import { pt } from '../pt';

function leaves(dict: Dictionary, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(dict)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') out[path] = value;
    else Object.assign(out, leaves(value, path));
  }
  return out;
}

const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

const english = leaves(en);

describe.each([
  ['es', es],
  ['pt', pt],
  ['de', de],
  ['fr', fr],
  ['it', italian],
])('%s dictionary', (_lang, dict) => {
  const translated = leaves(dict);

  it('has exactly the English keys', () => {
    expect(Object.keys(translated).sort()).toEqual(Object.keys(english).sort());
  });

  it('keeps every placeholder and leaves no string empty', () => {
    for (const [path, source] of Object.entries(english)) {
      const text = translated[path] ?? '';
      expect({ path, empty: text.trim() === '' && source.trim() !== '' }).toEqual({ path, empty: false });
      expect({ path, params: placeholders(text) }).toEqual({ path, params: placeholders(source) });
    }
  });
});

describe('native locale declaration', () => {
  it('app.config declares exactly the in-app languages', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- app.config is plain config, loaded the way Expo loads it
    const { SUPPORTED_LOCALES } = require('../../../app.config') as { SUPPORTED_LOCALES: string[] };
    expect([...SUPPORTED_LOCALES].sort()).toEqual([...LANGUAGES].sort());
  });
});

import { describe, expect, it } from 'vitest';
import { LANDING, en, isLandingLang, landingAlternates } from './index';

type Leaf = string | number | boolean;
function shape(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(shape);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, shape(v)]));
  return typeof (value as Leaf);
}
function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === 'object') return Object.values(value).flatMap(strings);
  return [];
}

describe('landing copy', () => {
  it.each(Object.entries(LANDING))('%s has the same structure as English, with nothing left empty', (lang, copy) => {
    expect(shape(copy)).toEqual(shape(en));
    expect(copy.lang).toBe(lang);
    for (const s of strings(copy)) expect(s.trim()).not.toBe('');
  });

  it.each(Object.entries({ en, ...LANDING }))('%s makes no health or IQ claims', (_lang, copy) => {
    const text = strings(copy).join(' ').toLowerCase();
    for (const banned of ['improve your memory', 'brain training', 'clinically', 'boost your iq', 'smarter']) expect(text).not.toContain(banned);
  });

  it('only accepts the translated languages', () => {
    expect(isLandingLang('es')).toBe(true);
    expect(isLandingLang('en')).toBe(false);
    expect(isLandingLang('toString')).toBe(false);
  });

  it('links every language version to the others', () => {
    const alt = landingAlternates('de');
    expect(alt?.canonical).toBe('/de');
    expect(alt?.languages).toMatchObject({ en: '/', es: '/es', pt: '/pt', de: '/de', fr: '/fr', it: '/it', 'x-default': '/' });
  });
});

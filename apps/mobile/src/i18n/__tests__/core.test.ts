import { interpolate, resolveLanguage, translate, type Path } from '../core';

const en = {
  home: { title: 'Climb', left_one: '{count} session left', left_other: '{count} sessions left', hello: 'Hi {name}' },
  only: { english: 'Only here' },
} as const;
const es = { home: { title: 'Escalar', left_one: 'Queda {count} sesión', left_other: 'Quedan {count} sesiones', hello: 'Hola {name}' }, only: {} };

describe('i18n core', () => {
  it('translates nested keys and falls back to English', () => {
    expect(translate(es, en, 'es', 'home.title')).toBe('Escalar');
    expect(translate(es, en, 'es', 'only.english')).toBe('Only here');
    expect(translate(es, en, 'es', 'missing.key')).toBe('missing.key');
  });

  it('selects plural forms per locale', () => {
    expect(translate(en, en, 'en', 'home.left', { count: 1 })).toBe('1 session left');
    expect(translate(en, en, 'en', 'home.left', { count: 3 })).toBe('3 sessions left');
    expect(translate(es, en, 'es', 'home.left', { count: 1 })).toBe('Queda 1 sesión');
    expect(translate(es, en, 'es', 'home.left', { count: 0 })).toBe('Quedan 0 sesiones');
  });

  it('interpolates names and formats numbers for the locale', () => {
    expect(translate(es, en, 'es', 'home.hello', { name: 'Ana' })).toBe('Hola Ana');
    expect(interpolate('{n} pts', { n: 12345 }, 'de')).toBe('12.345 pts');
    expect(interpolate('{n} pts', { n: 12345 }, 'en')).toBe('12,345 pts');
    expect(interpolate('{x}', {})).toBe('{x}');
  });

  it('resolves the language from preference or device', () => {
    expect(resolveLanguage('system', 'pt-BR')).toBe('pt');
    expect(resolveLanguage('system', 'ja')).toBe('en');
    expect(resolveLanguage('de', 'fr')).toBe('de');
    expect(resolveLanguage('system', null)).toBe('en');
  });

  it('types dotted paths with plurals collapsed', () => {
    const keys: Path<typeof en>[] = ['home.title', 'home.left', 'only.english'];
    expect(keys).toHaveLength(3);
  });
});

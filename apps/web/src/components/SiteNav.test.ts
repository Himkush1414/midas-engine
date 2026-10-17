import { describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({ usePathname: () => '/' }));
const { langOf } = await import('./SiteNav');

describe('langOf', () => {
  it('reads the language from translated landing pages only', () => {
    expect(langOf('/es')).toBe('es');
    expect(langOf('/fr/')).toBe('fr');
    expect(langOf('/')).toBe('en');
    expect(langOf('/privacy')).toBe('en');
    expect(langOf('/en')).toBe('en');
    expect(langOf('/duel/abcd2345')).toBe('en');
    expect(langOf(null)).toBe('en');
  });
});

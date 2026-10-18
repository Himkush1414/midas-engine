import { TIERS } from '@mindtier/core';
import { darkPalette, domainColors, domainColorsLight, lightPalette, tierColors, type Palette } from '../tokens';

/** WCAG 2.x relative luminance and contrast ratio. */
function luminance(hex: string): number {
  const lin = (i: number) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(1) + 0.7152 * lin(3) + 0.0722 * lin(5);
}
function contrast(a: string, b: string): number {
  const [la, lb] = [luminance(a), luminance(b)];
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

const themes: [string, Palette, Record<string, string>][] = [
  ['dark', darkPalette, domainColors],
  ['light', lightPalette, domainColorsLight],
];

describe.each(themes)('%s palette', (_name, c, domains) => {
  const grounds = { background: c.background, surface: c.surface, surfaceRaised: c.surfaceRaised };

  it.each(['text', 'textMuted', 'textFaint', 'primaryText', 'danger', 'success', 'accent', 'spark', 'warning'] as const)(
    '%s reads at AA (4.5:1) on every ground',
    (role) => {
      for (const ground of Object.values(grounds)) expect(contrast(c[role], ground)).toBeGreaterThanOrEqual(4.5);
    },
  );

  it('primary label reads at AAA on the primary face', () => {
    expect(contrast(c.onPrimary, c.primary)).toBeGreaterThanOrEqual(7);
  });

  it('inverse text reads on the text colour (chips that invert)', () => {
    expect(contrast(c.textInverse, c.text)).toBeGreaterThanOrEqual(4.5);
  });

  it('domain colours keep 3:1 for large text and icons on every ground', () => {
    for (const hue of Object.values(domains)) {
      for (const ground of Object.values(grounds)) expect(contrast(hue, ground)).toBeGreaterThanOrEqual(3);
    }
  });

  it('surfaces step in one direction away from the field', () => {
    const order = [c.surfaceSunken, c.background, c.surface, c.surfaceRaised].map(luminance);
    const rising = order.every((l, i) => i === 0 || l > order[i - 1]!);
    expect(rising).toBe(true);
  });
});

it('tier base colours stay visible as large shapes on the dark field (3:1)', () => {
  for (const tier of TIERS) expect(contrast(tierColors[tier].base, darkPalette.background)).toBeGreaterThanOrEqual(3);
});

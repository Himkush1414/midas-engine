/** Advance of an uppercase Big Shoulders Black glyph, in ems: 0.51 on average, 0.54 for tier names like GRANDMASTER; rounded up. */
const DISPLAY_EM = 0.55;

/**
 * Largest display font size (≤ max) at which `text` fits on one line in `width` points.
 * Works the same on native and web (react-native-web ignores adjustsFontSizeToFit).
 * Pass a wider `em` for lighter weights with tracking.
 */
export function fitDisplaySize(text: string, width: number, max: number, min = 24, em = DISPLAY_EM): number {
  const chars = Math.max(1, [...text].length);
  return Math.max(min, Math.min(max, Math.floor(width / (chars * em))));
}

/**
 * Largest micro-label size (8–11 pt) at which the longest word of `text` fits `width` on one line, so labels wrap
 * between words but never inside one (TAGESRÄTSEL, SITZUNGEN). JetBrains Mono glyphs are 0.6 em wide plus 1.3 pt
 * tracking; 4 pt of slack covers web sub-pixel rounding.
 */
export function fitMicroSize(text: string, width: number, max = 11, min = 8): number {
  const longest = Math.max(1, ...text.split(/\s+/).map((w) => [...w].length));
  return Math.max(min, Math.min(max, Math.floor((((width - 4) / longest - 1.3) / 0.6) * 2) / 2));
}

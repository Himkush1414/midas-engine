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

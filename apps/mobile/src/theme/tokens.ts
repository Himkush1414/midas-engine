import { TIER_COLORS, type Domain } from '@mindtier/core';

/**
 * Semantic colour roles for the Floodlight direction (docs/DESIGN_DIRECTION.md).
 * Every component reads colours from here, never hard-codes them.
 */
export interface Palette {
  /** The field: screen background. */
  background: string;
  /** The stand: plates and tickets on the field. */
  surface: string;
  /** Pressables and the plate in front. */
  surfaceRaised: string;
  /** Tracks, wells and empty segments. */
  surfaceSunken: string;
  /** Inputs and dividers only; surfaces never get an outline. */
  border: string;
  borderStrong: string;
  text: string;
  textMuted: string;
  textFaint: string;
  textInverse: string;
  /** Face of the one primary ("go") action on a screen. */
  primary: string;
  /** Solid lip under the primary face. */
  primaryLip: string;
  /** Primary colour for text and icons on the background (meets AA). */
  primaryText: string;
  primaryPressed: string;
  onPrimary: string;
  /** Lip under raised (secondary) pressables. */
  lip: string;
  accent: string;
  spark: string;
  success: string;
  danger: string;
  warning: string;
  overlay: string;
  /** Opacity of the grain tile over the field. */
  grain: number;
}

export const darkPalette: Palette = {
  background: '#0F0D0B',
  surface: '#1A1714',
  surfaceRaised: '#25211C',
  surfaceSunken: '#090807',
  border: '#332D27',
  borderStrong: '#4A4239',
  text: '#F4EFE6',
  textMuted: '#B7AD9E',
  textFaint: '#958C7E',
  textInverse: '#0F0D0B',
  primary: '#D7FF3A',
  primaryLip: '#8FAE12',
  primaryText: '#D7FF3A',
  primaryPressed: '#C4EC22',
  onPrimary: '#0F0D0B',
  lip: '#0A0908',
  accent: '#8FE3FF',
  spark: '#FFC93D',
  success: '#D7FF3A',
  danger: '#FF5B35',
  warning: '#FFB020',
  overlay: 'rgba(8, 7, 6, 0.78)',
  grain: 0.05,
};

export const lightPalette: Palette = {
  background: '#F1EBE1',
  surface: '#FAF6EF',
  surfaceRaised: '#FFFFFF',
  surfaceSunken: '#E5DDD0',
  border: '#D6CCBC',
  borderStrong: '#B9AD9A',
  text: '#15120F',
  textMuted: '#574E44',
  textFaint: '#6B6256',
  textInverse: '#FAF6EF',
  primary: '#15120F',
  primaryLip: '#000000',
  primaryText: '#4A5E00',
  primaryPressed: '#2A2520',
  onPrimary: '#D7FF3A',
  lip: '#CFC4B3',
  accent: '#0A6C8C',
  spark: '#8A5600',
  success: '#3F6B00',
  danger: '#C2361A',
  warning: '#9A5B00',
  overlay: 'rgba(21, 18, 15, 0.5)',
  grain: 0.04,
};

/** The volt signal colour, the same in both themes (labels on ink, faces on the field). */
export const VOLT = '#D7FF3A';

/** Tier colours are the same in both themes (shared with the website). */
export const tierColors = TIER_COLORS;

/** Light-theme steps of the domain hues, validated for ≥3:1 on white and the chroma floor. */
export const domainColorsLight: Record<Domain, string> = {
  memory: '#6D4CF5',
  focus: '#0891B2',
  speed: '#B45309',
  logic: '#047857',
  math: '#BE185D',
  // Orange keeps both floors against the other five (normal ΔE ≥ 15, deutan ≥ 10); blue sat too close to Memory.
  language: '#7C2D12',
};

/** Dark-theme domain hues (≥3:1 on the dark surfaces). */
export const domainColors: Record<Domain, string> = {
  memory: '#8B6CFF',
  focus: '#22D3EE',
  speed: '#FBBF24',
  logic: '#34D399',
  math: '#F472B6',
  language: '#F97316',
};

export const spacing = {
  /** Screen side margin. */
  gutter: 20,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radii = {
  xs: 4,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  pill: 999,
} as const;

export const fonts = {
  /** Big Shoulders: tier names, numbers, headlines, buttons (set uppercase). */
  display: 'BigShoulders_900Black',
  displayBold: 'BigShoulders_800ExtraBold',
  displayMedium: 'BigShoulders_700Bold',
  body: 'InstrumentSans_400Regular',
  bodyMedium: 'InstrumentSans_500Medium',
  bodySemibold: 'InstrumentSans_600SemiBold',
  bodyBold: 'InstrumentSans_700Bold',
  /** JetBrains Mono: uppercase micro-labels over data. */
  mono: 'JetBrainsMono_500Medium',
  monoBold: 'JetBrainsMono_700Bold',
} as const;

/** Type scale: [fontSize, lineHeight]. mega…heading use the display face. */
export const type = {
  mega: [96, 84],
  hero: [64, 58],
  title: [40, 38],
  heading: [28, 28],
  subheading: [20, 26],
  body: [16, 23],
  label: [14, 19],
  caption: [12, 16],
  micro: [11, 14],
} as const;

export const durations = {
  flash: 120,
  fast: 160,
  base: 240,
  slow: 420,
  ceremony: 1400,
} as const;

/** Spring presets of the motion language (docs/DESIGN_DIRECTION.md §6). */
export const springs = {
  press: { damping: 30, stiffness: 700 },
  release: { damping: 14, stiffness: 380 },
  enter: { damping: 18, stiffness: 200, mass: 0.9 },
  slam: { damping: 9, stiffness: 160 },
} as const;

/** Entrance stagger between siblings, and how many siblings animate at most. */
export const STAGGER_MS = 40;
export const STAGGER_MAX = 8;

/** The slant motif: progress segments, pips and highlights lean this far. */
export const SLANT_DEG = -12;

/** Lip heights under pressables, by size. */
export const lips = { lg: 5, md: 4, sm: 3 } as const;

/** Minimum touch target (Android guideline: 48dp). */
export const HIT_TARGET = 48;

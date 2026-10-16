import { TIER_COLORS, type Domain } from '@mindtier/core';

/** Semantic colour roles. Every component reads colours from here, never hard-codes them. */
export interface Palette {
  background: string;
  surface: string;
  surfaceRaised: string;
  surfaceSunken: string;
  border: string;
  borderStrong: string;
  text: string;
  textMuted: string;
  textFaint: string;
  textInverse: string;
  /** Fill colour for primary buttons (white label meets AA). */
  primary: string;
  /** Primary colour for text and icons on the background (meets AA). */
  primaryText: string;
  primaryPressed: string;
  onPrimary: string;
  accent: string;
  spark: string;
  success: string;
  danger: string;
  warning: string;
  overlay: string;
  /** Gradient used for hero surfaces and the brand edge. */
  brandGradient: [string, string];
}

export const darkPalette: Palette = {
  background: '#0A0D1A',
  surface: '#121734',
  surfaceRaised: '#1A2045',
  surfaceSunken: '#070913',
  border: '#232A55',
  borderStrong: '#343D78',
  text: '#F4F6FF',
  textMuted: '#A3ABD1',
  textFaint: '#7D85AC',
  textInverse: '#0A0D1A',
  primary: '#6D4CF5',
  primaryText: '#A996FF',
  primaryPressed: '#5B3BE0',
  onPrimary: '#FFFFFF',
  accent: '#22D3EE',
  spark: '#FCD34D',
  success: '#34D399',
  danger: '#F87171',
  warning: '#FBBF24',
  overlay: 'rgba(5, 7, 15, 0.72)',
  brandGradient: ['#8B6CFF', '#22D3EE'],
};

export const lightPalette: Palette = {
  background: '#F5F6FB',
  surface: '#FFFFFF',
  surfaceRaised: '#FFFFFF',
  surfaceSunken: '#E9ECF6',
  border: '#DDE1F0',
  borderStrong: '#C3C9E2',
  text: '#0E1230',
  textMuted: '#4B5378',
  textFaint: '#5F678A',
  textInverse: '#FFFFFF',
  primary: '#6A47F5',
  primaryText: '#6A47F5',
  primaryPressed: '#5835E0',
  onPrimary: '#FFFFFF',
  accent: '#0E7490',
  spark: '#D99A06',
  success: '#047857',
  danger: '#DC2626',
  warning: '#B45309',
  overlay: 'rgba(14, 18, 48, 0.45)',
  brandGradient: ['#6A47F5', '#0891B2'],
};

/** Tier colours are the same in both themes (shared with the website). */
export const tierColors = TIER_COLORS;

/** Light-theme steps of the domain hues, validated for ≥3:1 on white and the chroma floor. */
export const domainColorsLight: Record<Domain, string> = {
  memory: '#6D4CF5',
  focus: '#0891B2',
  speed: '#B45309',
  logic: '#047857',
  math: '#BE185D',
};

/** Dark-theme domain hues (≥3:1 on the dark surfaces). */
export const domainColors: Record<Domain, string> = {
  memory: '#8B6CFF',
  focus: '#22D3EE',
  speed: '#FBBF24',
  logic: '#34D399',
  math: '#F472B6',
};

export const spacing = {
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
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const fonts = {
  display: 'SpaceGrotesk_700Bold',
  displayMedium: 'SpaceGrotesk_600SemiBold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemibold: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
} as const;

/** Type scale: [fontSize, lineHeight]. */
export const type = {
  hero: [44, 50],
  title: [28, 34],
  heading: [22, 28],
  subheading: [18, 24],
  body: [16, 22],
  label: [14, 18],
  caption: [12, 16],
} as const;

export const durations = {
  fast: 140,
  base: 220,
  slow: 420,
  ceremony: 1200,
} as const;

/** Minimum touch target (Android guideline: 48dp). */
export const HIT_TARGET = 48;

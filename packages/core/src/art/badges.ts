import type { TierId } from '../tiers';

/**
 * Tier badge artwork on a 100×100 canvas, shared by the in-app badge and the
 * share-card renderer so both stay pixel-identical.
 */
export const BADGE_OUTER = '50,4 89.8,27 89.8,73 50,96 10.2,73 10.2,27';
export const BADGE_INNER = '50,12 82.9,31 82.9,69 50,88 17.1,69 17.1,31';

const chevron = (y: number) => `M36 ${y + 6} L50 ${y - 4} L64 ${y + 6}`;

/** Stroke paths (round caps) for each emblem, plus optional filled paths. */
export const EMBLEMS: Record<TierId, { stroke: string[]; fill: string[] }> = {
  iron: { stroke: [chevron(48)], fill: [] },
  bronze: { stroke: [chevron(42), chevron(55)], fill: [] },
  silver: { stroke: [chevron(36), chevron(47), chevron(58)], fill: [] },
  gold: {
    stroke: [],
    fill: ['M50 28l5.3 10.8 11.9 1.7-8.6 8.4 2 11.8L50 55.1l-10.6 5.6 2-11.8-8.6-8.4 11.9-1.7z'],
  },
  platinum: { stroke: ['M50 28 L66 47 L50 66 L34 47 Z', 'M50 36 L58 47 L50 58 L42 47 Z'], fill: [] },
  diamond: {
    stroke: ['M35 39 L43 29 H57 L65 39 L50 65 Z', 'M35 39 H65 M43 29 L50 39 L57 29 M50 39 V65'],
    fill: [],
  },
  master: { stroke: ['M32 60 L34 36 L42 46 L50 31 L58 46 L66 36 L68 60 Z'], fill: [] },
  grandmaster: {
    stroke: ['M32 62 L34 39 L42 48 L50 34 L58 48 L66 39 L68 62 Z'],
    fill: ['M50 18l2.2 4.5 4.9.7-3.6 3.5.9 4.9-4.4-2.3-4.4 2.3.9-4.9-3.6-3.5 4.9-.7z'],
  },
};

export const PIP_Y = 79;
export const PIP_XS = [41, 47, 53, 59] as const;

/** Light tiers get dark emblems for contrast. */
export const LIGHT_TIERS: ReadonlySet<TierId> = new Set(['silver', 'gold', 'platinum']);

/** Tier palette shared by the app and the website: highlight → base → deep. */
export const TIER_COLORS: Record<TierId, { highlight: string; base: string; deep: string }> = {
  iron: { highlight: '#B4B9C4', base: '#7E8492', deep: '#4B505C' },
  bronze: { highlight: '#F0B27A', base: '#C9773B', deep: '#7A4219' },
  silver: { highlight: '#F1F4F9', base: '#B8C2D2', deep: '#6F7B90' },
  gold: { highlight: '#FFE7A0', base: '#F4BE3A', deep: '#A7700A' },
  platinum: { highlight: '#A7F3E4', base: '#2DD4BF', deep: '#0F766E' },
  diamond: { highlight: '#BAE6FD', base: '#60A5FA', deep: '#4338CA' },
  master: { highlight: '#E9D5FF', base: '#A855F7', deep: '#6B21A8' },
  grandmaster: { highlight: '#FFE4E6', base: '#F43F5E', deep: '#9F1239' },
};

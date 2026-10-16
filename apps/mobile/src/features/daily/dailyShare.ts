import { getGame, type GameId } from '@mindtier/core';
import { getT } from '@/i18n';
import { domainLabel } from '@/i18n/labels';
import { links } from '@/lib/links';

const FILLED = '■';
const EMPTY = '□';
const BLOCKS = 5;

/** Five-block accuracy bar, e.g. 0.8 → "■■■■□". A full bar means a perfect game. */
export function accuracyBar(accuracy: number): string {
  const filled = Math.max(0, Math.min(BLOCKS, Math.floor(accuracy * BLOCKS + 1e-9)));
  return FILLED.repeat(filled) + EMPTY.repeat(BLOCKS - filled);
}

/** Spoiler-free share text: shows how well you did, never what the puzzles were. */
export function dailyShareText(day: string, points: number, games: readonly GameId[], accuracy: readonly number[], percentile?: number | null): string {
  const t = getT();
  const lines = games.map((g, i) => `${accuracyBar(accuracy[i] ?? 0)} ${domainLabel(t, getGame(g).domain)}`);
  const header = t('daily.shareHeader', { day, points }) + (percentile ? t('daily.shareTop', { percent: Math.max(1, 100 - percentile + 1) }) : '');
  return [header, ...lines, '', links.home].join('\n');
}

/** Time until the next Daily Challenge (00:00 UTC). */
export function untilNextDaily(now: Date): { hours: number; minutes: number } {
  const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
  const mins = Math.max(0, Math.ceil((next - now.getTime()) / 60_000));
  return { hours: Math.floor(mins / 60), minutes: mins % 60 };
}

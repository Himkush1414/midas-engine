import { DOMAINS, bestSeasonDomain, seasonBounds, tierInfo, type Domain, type SeasonStats, type TierInfo } from '@mindtier/core';
import type { TFunction } from '@/i18n';
import { domainLabel, tierLabel } from '@/i18n/labels';
import { links } from '@/lib/links';

export function seasonName(t: TFunction, season: number): string {
  return season <= 0 ? t('season.preseason') : t('season.name', { n: season });
}

/** "November 2026" in the player's language; null for the preseason. */
export function seasonMonth(season: number, locale: string): string | null {
  const { start } = seasonBounds(season);
  if (!start) return null;
  try {
    return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(start);
  } catch {
    return start.toISOString().slice(0, 7);
  }
}

/** Tier of an overall rating with its uncertainty ignored: recaps show where the player stood. */
export function tierAt(rating: number): TierInfo {
  return tierInfo({ rating, rd: 0 });
}

export interface SeasonRecap {
  season: number;
  sessions: number;
  games: number;
  peak: TierInfo;
  peakRating: number;
  end: TierInfo;
  endRating: number;
  best: { domain: Domain; gain: number } | null;
  /** Rounded net change per domain, in display order; domains not played this season are left out. */
  gains: { domain: Domain; gain: number }[];
}

export function seasonRecap(stats: SeasonStats): SeasonRecap {
  const best = bestSeasonDomain(stats);
  return {
    season: stats.season,
    sessions: stats.sessions,
    games: stats.games,
    peak: tierAt(stats.peakRating),
    peakRating: Math.round(stats.peakRating),
    end: tierAt(stats.endRating),
    endRating: Math.round(stats.endRating),
    best: best ? { domain: best.domain, gain: Math.round(best.gain) } : null,
    gains: DOMAINS.filter((d) => stats.gains[d] !== undefined).map((d) => ({ domain: d, gain: Math.round(stats.gains[d] ?? 0) })),
  };
}

/** Spoiler-free share text: peak tier and effort, no rating numbers. */
export function seasonShareText(t: TFunction, recap: SeasonRecap): string {
  const lines = [
    t('season.shareHeader', { season: seasonName(t, recap.season), peak: tierLabel(t, recap.peak) }),
    t('season.shareSessions', { count: recap.sessions }),
  ];
  if (recap.best) lines.push(t('season.shareBest', { domain: domainLabel(t, recap.best.domain) }));
  lines.push('', t('share.yours', { url: links.home }));
  return lines.join('\n');
}

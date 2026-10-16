import { DOMAINS, overallRating, tierInfo, type DomainRatings } from '@mindtier/core';
import { getT } from '@/i18n';
import { domainLabel, tierLabel } from '@/i18n/labels';
import { Share } from 'react-native';
import { links } from './links';

/** Spoiler-free, link-friendly share text for a player's tier. */
export function tierShareText(ratings: DomainRatings): string {
  const t = getT();
  const overall = tierInfo(overallRating(ratings));
  const lines = DOMAINS.map((d) => `${domainLabel(t, d)}: ${tierLabel(t, tierInfo(ratings[d]))}`);
  return [t('share.placed', { label: tierLabel(t, overall) }), ...lines, '', t('share.yours', { url: links.home })].join('\n');
}

export async function shareText(message: string): Promise<boolean> {
  try {
    const result = await Share.share({ message });
    return result.action === Share.sharedAction;
  } catch {
    return false;
  }
}

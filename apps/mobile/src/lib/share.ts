import { DOMAINS, DOMAIN_LABELS, overallRating, tierInfo, type DomainRatings } from '@mindtier/core';
import { Share } from 'react-native';
import { links } from './links';

/** Spoiler-free, link-friendly share text for a player's tier. */
export function tierShareText(ratings: DomainRatings): string {
  const overall = tierInfo(overallRating(ratings));
  const lines = DOMAINS.map((d) => `${DOMAIN_LABELS[d]}: ${tierInfo(ratings[d]).label}`);
  return [`My mind placed ${overall.label} on Mindtier.`, ...lines, '', `What tier is yours? ${links.home}`].join('\n');
}

export async function shareText(message: string): Promise<boolean> {
  try {
    const result = await Share.share({ message });
    return result.action === Share.sharedAction;
  } catch {
    return false;
  }
}

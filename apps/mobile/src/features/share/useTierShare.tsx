import type { DomainRatings } from '@mindtier/core';
import { useCallback, type ReactNode } from 'react';
import { tierShareText } from '@/lib/share';
import { TierShareCard } from './TierShareCard';
import { useCardShare } from './useCardShare';

/** Share the player's tier as an image card (text where images can't be shared). */
export function useTierShare(ratings: DomainRatings): { share(): Promise<void>; card: ReactNode } {
  const text = useCallback(() => tierShareText(ratings), [ratings]);
  return useCardShare((ref) => <TierShareCard ref={ref} ratings={ratings} />, text, 'tier');
}

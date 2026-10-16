import type { Domain, GameId, TierInfo } from '@mindtier/core';
import type { TFunction } from './index';

const ROMAN = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV' } as const;

/** Localised tier label, e.g. "Oro II". */
export function tierLabel(t: TFunction, info: Pick<TierInfo, 'tier' | 'division'>): string {
  const name = t(`tiers.${info.tier}`);
  return info.division ? `${name} ${ROMAN[info.division]}` : name;
}

export function domainLabel(t: TFunction, domain: Domain): string {
  return t(`domains.${domain}`);
}

export function gameRules(t: TFunction, game: GameId): string {
  return t(`games.${game}`);
}

import { DOMAINS, type Domain } from '../domains';
import { balance } from './balance';
import { clash } from './clash';
import { echo } from './echo';
import { estimate } from './estimate';
import { flank } from './flank';
import { gridRecall } from './grid-recall';
import { match } from './match';
import { pathTrace } from './path-trace';
import { pattern } from './pattern';
import { quickSum } from './quick-sum';
import { route } from './route';
import { snap } from './snap';
import { spot } from './spot';
import { GAME_IDS, type AnyGameDefinition, type GameId } from './types';

export const GAMES: Record<GameId, AnyGameDefinition> = {
  'grid-recall': gridRecall,
  'path-trace': pathTrace,
  echo,
  flank,
  clash,
  spot,
  snap,
  match,
  pattern,
  balance,
  route,
  'quick-sum': quickSum,
  estimate,
};

export function getGame(id: GameId): AnyGameDefinition {
  return GAMES[id];
}

export function isGameId(value: unknown): value is GameId {
  return typeof value === 'string' && (GAME_IDS as readonly string[]).includes(value);
}

export const GAMES_BY_DOMAIN: Record<Domain, GameId[]> = Object.fromEntries(
  DOMAINS.map((d) => [d, GAME_IDS.filter((id) => GAMES[id].domain === d)]),
) as Record<Domain, GameId[]>;

/** The game used for each domain's placement match: quick to learn, high signal. */
export const PLACEMENT_GAMES: Record<Domain, GameId> = {
  memory: 'grid-recall',
  focus: 'flank',
  speed: 'snap',
  logic: 'pattern',
  math: 'quick-sum',
};

/** Games available in Zen mode without Pro (one per domain). */
export const FREE_ZEN_GAMES: readonly GameId[] = Object.values(PLACEMENT_GAMES);

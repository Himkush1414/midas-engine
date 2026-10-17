import { describe, expect, it } from 'vitest';
import { DOMAINS } from '../domains';
import { newRating } from '../glicko2';
import { GAMES, GAMES_BY_DOMAIN, PLACEMENT_GAMES, getGame, isGameId } from '../games/registry';
import { GAME_IDS } from '../games/types';
import {
  dailyPlan,
  duelPlan,
  enabledGames,
  focusPlan,
  gameSeed,
  placementPlan,
  rankedPlan,
  utcDayKey,
  zenPlan,
} from '../sessions';
import type { DomainRatings } from '../tiers';

const ratings = (overrides: Partial<Record<(typeof DOMAINS)[number], number>> = {}): DomainRatings =>
  Object.fromEntries(DOMAINS.map((d) => [d, newRating(1300, overrides[d] ?? 80)])) as DomainRatings;

describe('registry', () => {
  it('registers every game under its own id', () => {
    expect(Object.keys(GAMES)).toHaveLength(GAME_IDS.length);
    for (const id of GAME_IDS) expect(getGame(id).id).toBe(id);
  });

  it('gives every domain at least two games', () => {
    for (const d of DOMAINS) expect(GAMES_BY_DOMAIN[d].length).toBeGreaterThanOrEqual(2);
  });

  it('uses a game from the right domain for each placement', () => {
    for (const d of DOMAINS) expect(GAMES[PLACEMENT_GAMES[d]].domain).toBe(d);
  });

  it('validates game ids', () => {
    expect(isGameId('echo')).toBe(true);
    expect(isGameId('chess')).toBe(false);
  });
});

describe('session plans', () => {
  it('places one game per domain', () => {
    const plan = placementPlan('user-1');
    expect(plan.games.map((g) => GAMES[g].domain)).toEqual([...DOMAINS]);
  });

  it('builds ranked sessions from three distinct domains including the least certain', () => {
    const plan = rankedPlan('user-1', 4, ratings({ logic: 300 }));
    const domains = plan.games.map((g) => GAMES[g].domain);
    expect(new Set(domains).size).toBe(3);
    expect(domains).toContain('logic');
  });

  it('is deterministic per user and session index', () => {
    expect(rankedPlan('u', 1, ratings())).toEqual(rankedPlan('u', 1, ratings()));
    const variety = new Set(Array.from({ length: 20 }, (_, i) => rankedPlan('u', i, ratings()).games.join(',')));
    expect(variety.size).toBeGreaterThan(5);
  });

  it('respects hidden games', () => {
    const hidden = new Set(['grid-recall', 'path-trace'] as const);
    for (let i = 0; i < 50; i++) {
      const plan = rankedPlan('h', i, ratings({ memory: 350 }), hidden);
      expect(plan.games).toContain('echo');
      for (const g of plan.games) expect(hidden.has(g as never)).toBe(false);
    }
  });

  it('never lets hiding empty a domain', () => {
    expect(enabledGames('speed', new Set(['snap', 'match']))).toEqual(GAMES_BY_DOMAIN.speed);
  });

  it('builds focus sessions from one domain', () => {
    const plan = focusPlan('u', 0, 'math');
    expect(plan.games).toHaveLength(3);
    for (const g of plan.games) expect(GAMES[g].domain).toBe('math');
    expect(new Set(plan.games).size).toBe(2);
  });

  it('gives everyone the same daily plan for a UTC day', () => {
    const a = dailyPlan('2026-10-16');
    expect(dailyPlan('2026-10-16')).toEqual(a);
    expect(a.mode).toBe('daily');
    expect(new Set(a.games.map((g) => GAMES[g].domain)).size).toBe(3);
    const week = new Set(Array.from({ length: 7 }, (_, i) => dailyPlan(`2026-10-${10 + i}`).games.join(',')));
    expect(week.size).toBeGreaterThan(4);
  });

  it('gives both duelists the same plan', () => {
    expect(duelPlan('duel-abc')).toEqual(duelPlan('duel-abc'));
    expect(duelPlan('duel-abc').mode).toBe('duel');
  });

  it('keys days in UTC', () => {
    expect(utcDayKey(new Date('2026-10-16T23:59:59.000-05:00'))).toBe('2026-10-17');
  });

  it('derives distinct per-game seeds', () => {
    const plan = zenPlan('echo', 'n1');
    expect(gameSeed(plan, 0)).not.toBe(gameSeed(plan, 1));
  });
});

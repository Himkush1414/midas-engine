import type { SeasonStats } from '@mindtier/core';
import { getT } from '@/i18n';
import { seasonMonth, seasonName, seasonRecap, seasonShareText } from '../season';

const stats: SeasonStats = {
  season: 2,
  sessions: 9,
  games: 27,
  startRating: 1480,
  peakRating: 1560.4,
  endRating: 1532.6,
  gains: { memory: 61.7, logic: -12.2, focus: 8 },
};

describe('season helpers', () => {
  it('names the preseason and numbered seasons', () => {
    const t = getT();
    expect(seasonName(t, 0)).toBe('Preseason');
    expect(seasonName(t, 3)).toBe('Season 3');
  });

  it('shows the calendar month of a season', () => {
    expect(seasonMonth(1, 'en')).toBe('November 2026');
    expect(seasonMonth(3, 'en')).toBe('January 2027');
    expect(seasonMonth(0, 'en')).toBeNull();
  });

  it('summarises a season for the recap', () => {
    const r = seasonRecap(stats);
    expect(r).toMatchObject({ season: 2, sessions: 9, games: 27, peakRating: 1560, endRating: 1533 });
    expect(r.peak).toMatchObject({ tier: 'platinum', division: 3 });
    expect(r.best).toEqual({ domain: 'memory', gain: 62 });
    expect(r.gains.map((g) => g.domain)).toEqual(['memory', 'focus', 'logic']);
  });

  it('shares peak tier and effort without rating numbers', () => {
    const text = seasonShareText(getT(), seasonRecap(stats));
    expect(text).toContain('Season 2 on Mindtier: I peaked at Platinum III.');
    expect(text).toContain('9 sessions played.');
    expect(text).toContain('Biggest climb: Memory.');
    expect(text).not.toContain('1560');
    expect(text).toContain('https://');
  });
});

import { domainSeries, windowDelta } from '../history';

const DAY = 86_400_000;
const now = Date.parse('2026-10-16T12:00:00Z');
const history = [
  { at: now - 40 * DAY, domain: 'math' as const, rating: 1200, rd: 200 },
  { at: now - 10 * DAY, domain: 'math' as const, rating: 1300, rd: 150 },
  { at: now - 1 * DAY, domain: 'math' as const, rating: 1350, rd: 120 },
  { at: now - 1 * DAY, domain: 'logic' as const, rating: 1500, rd: 120 },
];

describe('rating history', () => {
  it('limits free players to the last 30 days', () => {
    const s = domainSeries(history, 'math', { isPro: false, now });
    expect(s.points.map((p) => p.value)).toEqual([1300, 1350]);
    expect(s.truncated).toBe(true);
  });

  it('shows everything with Pro', () => {
    const s = domainSeries(history, 'math', { isPro: true, now });
    expect(s.points).toHaveLength(3);
    expect(s.truncated).toBe(false);
    expect(windowDelta(s.points)).toBe(150);
  });

  it('falls back to the starting rating with no history', () => {
    expect(domainSeries(history, 'speed', { isPro: false, now, startRating: 1300 }).points).toEqual([{ at: now, value: 1300 }]);
  });
});

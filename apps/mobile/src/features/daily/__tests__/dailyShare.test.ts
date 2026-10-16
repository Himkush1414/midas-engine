import { accuracyBar, dailyShareText, untilNextDaily } from '../dailyShare';

describe('daily share', () => {
  it('draws five-block accuracy bars', () => {
    expect(accuracyBar(0)).toBe('□□□□□');
    expect(accuracyBar(0.8)).toBe('■■■■□');
    expect(accuracyBar(1)).toBe('■■■■■');
    expect(accuracyBar(1.4)).toBe('■■■■■');
    expect(accuracyBar(0.99)).toBe('■■■■□');
  });

  it('builds spoiler-free text with domains, not answers', () => {
    const text = dailyShareText('2026-10-16', 1234, ['flank', 'pattern', 'quick-sum'], [0.9, 0.6, 1], 92);
    expect(text).toContain('Mindtier Daily 2026-10-16 · 1,234 pts · top 9%');
    expect(text).toContain('■■■■□ Focus');
    expect(text).toContain('■■■□□ Logic');
    expect(text).toContain('■■■■■ Math');
    expect(text).toContain('https://');
  });

  it('counts down to midnight UTC', () => {
    expect(untilNextDaily(new Date('2026-10-16T22:30:00Z'))).toEqual({ hours: 1, minutes: 30 });
    expect(untilNextDaily(new Date('2026-10-16T00:00:30Z'))).toEqual({ hours: 24, minutes: 0 });
  });
});

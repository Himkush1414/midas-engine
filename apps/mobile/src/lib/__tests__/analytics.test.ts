import { flushAnalytics, readQueue, setAnalyticsOptOut, track } from '../analytics';

beforeEach(() => {
  setAnalyticsOptOut(true);
  setAnalyticsOptOut(false);
});

describe('analytics', () => {
  it('buffers events and flushes them after a successful upload', async () => {
    track('app_opened');
    track('paywall_viewed', { from: 'home' });
    expect(readQueue()).toHaveLength(2);
    const sent: unknown[] = [];
    const n = await flushAnalytics(async (batch) => {
      sent.push(...batch);
      return true;
    });
    expect(n).toBe(2);
    expect(sent).toHaveLength(2);
    expect(readQueue()).toHaveLength(0);
  });

  it('keeps events when the upload fails', async () => {
    track('app_opened');
    await flushAnalytics(async () => false);
    expect(readQueue()).toHaveLength(1);
    await flushAnalytics(async () => {
      throw new Error('offline');
    });
    expect(readQueue()).toHaveLength(1);
  });

  it('drops everything and records nothing after opting out', () => {
    track('app_opened');
    setAnalyticsOptOut(true);
    track('app_opened');
    expect(readQueue()).toHaveLength(0);
  });

  it('caps the local queue', () => {
    for (let i = 0; i < 600; i++) track('game_completed', { i });
    expect(readQueue()).toHaveLength(500);
  });
});

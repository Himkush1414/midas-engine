import { COOLDOWN_DAYS, MIN_GAMES, shouldAskForReview } from '../review';

jest.mock('expo-store-review', () => ({ isAvailableAsync: jest.fn(async () => true), requestReview: jest.fn(async () => undefined) }));

describe('review prompt gating', () => {
  const now = Date.parse('2026-10-16T00:00:00Z');
  it('waits for real engagement', () => {
    expect(shouldAskForReview(MIN_GAMES - 1, null, now)).toBe(false);
    expect(shouldAskForReview(MIN_GAMES, null, now)).toBe(true);
  });
  it('respects the cooldown', () => {
    expect(shouldAskForReview(100, now - (COOLDOWN_DAYS - 1) * 86_400_000, now)).toBe(false);
    expect(shouldAskForReview(100, now - (COOLDOWN_DAYS + 1) * 86_400_000, now)).toBe(true);
  });
});

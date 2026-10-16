import { describe, expect, it, vi } from 'vitest';
import { EXPO_TOKEN, duelResultMessage, sendPush } from './push';

const TOKEN = 'ExponentPushToken[abcdefghij0123456789]';

describe('duel push messages', () => {
  it('tells the creator when their friend wins, loses, draws or plays first', () => {
    const base = { token: TOKEN, duelId: 'abcd2345', playerName: 'Sam' };
    expect(duelResultMessage({ ...base, playerPoints: 2000, recipientPoints: 1500 }).body).toContain('Sam beat your score');
    expect(duelResultMessage({ ...base, playerPoints: 1000, recipientPoints: 1500 }).body).toContain('You won!');
    expect(duelResultMessage({ ...base, playerPoints: 1500, recipientPoints: 1500 }).body).toContain('draw');
    expect(duelResultMessage({ ...base, playerPoints: 1500, recipientPoints: null }).body).toContain('your turn');
  });

  it('deep-links to the duel', () => {
    expect(duelResultMessage({ token: TOKEN, duelId: 'abcd2345', playerName: 'A', playerPoints: 1, recipientPoints: 2 }).data.url).toBe('mindtier://duel/abcd2345');
  });

  it('validates Expo tokens', () => {
    expect(EXPO_TOKEN.test(TOKEN)).toBe(true);
    expect(EXPO_TOKEN.test('ExpoPushToken[abcdefghij0123456789]')).toBe(true);
    expect(EXPO_TOKEN.test('not-a-token')).toBe(false);
  });

  it('only sends valid tokens and never throws', async () => {
    const ok = vi.fn(async () => new Response('{}', { status: 200 }));
    const msg = duelResultMessage({ token: TOKEN, duelId: 'abcd2345', playerName: 'A', playerPoints: 1, recipientPoints: 2 });
    expect(await sendPush([msg, { ...msg, to: 'bad' }], ok as unknown as typeof fetch)).toBe(1);
    const boom = vi.fn(async () => {
      throw new Error('network');
    });
    expect(await sendPush([msg], boom as unknown as typeof fetch)).toBe(0);
    expect(await sendPush([{ ...msg, to: 'bad' }], ok as unknown as typeof fetch)).toBe(0);
  });
});

import { normaliseDuelCode, useDuels } from '../duels';

beforeEach(() => useDuels.getState().reset());

describe('duels store', () => {
  it('normalises codes and invite links', () => {
    expect(normaliseDuelCode('abcd2345')).toBe('abcd2345');
    expect(normaliseDuelCode('  ABCD2345 ')).toBe('abcd2345');
    expect(normaliseDuelCode('https://midas-engine.vercel.app/duel/abcd2345')).toBe('abcd2345');
    expect(normaliseDuelCode('mindtier://duel/abcd2345/')).toBe('abcd2345');
    expect(normaliseDuelCode('short')).toBeNull();
    expect(normaliseDuelCode('abcd-2345')).toBeNull();
  });

  it('upserts newest first and records my run', () => {
    useDuels.getState().upsert({ id: 'aaaaaaaa', role: 'creator' });
    useDuels.getState().upsert({ id: 'bbbbbbbb' });
    useDuels.getState().upsert({ id: 'aaaaaaaa', opponent: { name: 'Sam', points: 900 } });
    const { duels } = useDuels.getState();
    expect(duels.map((d) => d.id)).toEqual(['aaaaaaaa', 'bbbbbbbb']);
    expect(duels[0]).toMatchObject({ role: 'creator', opponent: { name: 'Sam', points: 900 } });
    useDuels.getState().recordMyRun('bbbbbbbb', 1200);
    expect(useDuels.getState().duels[1]?.myPoints).toBe(1200);
  });
});

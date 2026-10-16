import { describe, expect, it } from 'vitest';
import { duelId } from './ids';

describe('duelId', () => {
  it('produces 8 readable characters matching the database constraint', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 2000; i++) {
      const id = duelId();
      expect(id).toMatch(/^[a-z0-9]{8}$/);
      expect(id).not.toMatch(/[lo01]/);
      ids.add(id);
    }
    expect(ids.size).toBe(2000);
  });
});

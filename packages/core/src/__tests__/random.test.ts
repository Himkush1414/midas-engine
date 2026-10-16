import { describe, expect, it } from 'vitest';
import { Rng, hashSeed, seedFor } from '../random';

describe('hashSeed', () => {
  it('is stable for a known input', () => {
    expect(hashSeed('mindtier')).toEqual(hashSeed('mindtier'));
    expect(hashSeed('mindtier')).not.toEqual(hashSeed('mindtiers'));
  });

  it('produces unsigned 32-bit words', () => {
    for (const w of hashSeed('x')) {
      expect(Number.isInteger(w)).toBe(true);
      expect(w).toBeGreaterThanOrEqual(0);
      expect(w).toBeLessThan(2 ** 32);
    }
  });
});

describe('Rng', () => {
  it('replays the same sequence for the same seed', () => {
    const a = new Rng('daily|2026-10-16');
    const b = new Rng('daily|2026-10-16');
    const seqA = Array.from({ length: 50 }, () => a.nextUint32());
    const seqB = Array.from({ length: 50 }, () => b.nextUint32());
    expect(seqA).toEqual(seqB);
  });

  it('pins the first outputs so cross-platform drift is caught', () => {
    const r = new Rng('golden');
    const first = [r.nextUint32(), r.nextUint32(), r.nextUint32()];
    // Golden values: if these change, every stored daily/duel seed changes meaning.
    expect(first).toMatchInlineSnapshot(`
      [
        2459897739,
        2291529163,
        2283349543,
      ]
    `);
  });

  it('diverges for neighbouring seeds', () => {
    expect(new Rng('seed-1').next()).not.toBe(new Rng('seed-2').next());
  });

  it('keeps next() within [0, 1)', () => {
    const r = new Rng('range');
    for (let i = 0; i < 10_000; i++) {
      const v = r.next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('int() is inclusive and roughly uniform', () => {
    const r = new Rng('uniform');
    const counts = new Array<number>(6).fill(0);
    const n = 60_000;
    for (let i = 0; i < n; i++) counts[r.int(1, 6) - 1]! += 1;
    for (const c of counts) expect(Math.abs(c - n / 6)).toBeLessThan(n * 0.01);
  });

  it('int() rejects invalid ranges', () => {
    const r = new Rng('bad');
    expect(() => r.int(5, 1)).toThrow(RangeError);
    expect(() => r.int(0.5, 2)).toThrow(RangeError);
  });

  it('shuffle() is a permutation and does not mutate input', () => {
    const r = new Rng('shuffle');
    const input = [1, 2, 3, 4, 5, 6, 7, 8];
    const out = r.shuffle(input);
    expect(out.slice().sort((x, y) => x - y)).toEqual(input);
    expect(input).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('sample() returns distinct values in range', () => {
    const r = new Rng('sample');
    const s = r.sample(0, 15, 7);
    expect(new Set(s).size).toBe(7);
    for (const v of s) expect(v >= 0 && v <= 15).toBe(true);
    expect(() => r.sample(0, 3, 5)).toThrow(RangeError);
  });

  it('pick() throws on empty input', () => {
    expect(() => new Rng('p').pick([])).toThrow(RangeError);
  });

  it('fork() yields deterministic independent streams', () => {
    const a = new Rng('parent').fork('trial-1');
    const b = new Rng('parent').fork('trial-1');
    const c = new Rng('parent').fork('trial-2');
    expect(a.next()).toBe(b.next());
    expect(new Rng('parent').fork('trial-1').next()).not.toBe(c.next());
  });
});

describe('seedFor', () => {
  it('joins parts with a separator', () => {
    expect(seedFor('duel', 'abc', 3)).toBe('duel|abc|3');
  });
});

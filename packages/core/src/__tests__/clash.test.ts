import { describe, expect, it } from 'vitest';
import { CLASH_ATTRIBUTES, clash, clashAnswer } from '../games/clash';
import { Rng } from '../random';
import { describeGameContract } from './contract';

describeGameContract(clash);

describe('clash', () => {
  const sample = (level: number, n = 600) =>
    Array.from({ length: n }, (_, s) => clash.generate(new Rng(`c${level}-${s}`), level));

  it('keeps yes/no answers balanced', () => {
    const yes = sample(8).filter(clashAnswer).length / 600;
    expect(yes).toBeGreaterThan(0.4);
    expect(yes).toBeLessThan(0.6);
  });

  it('gets more incongruent with level', () => {
    const inc = (level: number) => sample(level).filter((t) => t.word !== t.ink).length / 600;
    expect(inc(16)).toBeGreaterThan(inc(1) + 0.3);
  });

  it('asks about meaning only from level 10', () => {
    expect(sample(9).every((t) => t.ask === 'ink')).toBe(true);
    expect(sample(14).some((t) => t.ask === 'meaning')).toBe(true);
  });

  it('keeps attribute ids in range', () => {
    for (const t of sample(16, 200)) {
      for (const v of [t.word, t.ink, t.probe]) expect(v >= 0 && v < CLASH_ATTRIBUTES).toBe(true);
    }
  });

  it('answers by the asked property', () => {
    expect(clashAnswer({ word: 1, ink: 2, probe: 2, ask: 'ink' })).toBe(true);
    expect(clashAnswer({ word: 1, ink: 2, probe: 1, ask: 'ink' })).toBe(false);
    expect(clashAnswer({ word: 1, ink: 2, probe: 1, ask: 'meaning' })).toBe(true);
  });

  it('treats no answer as wrong', () => {
    expect(clash.evaluate({ word: 0, ink: 0, probe: 3, ask: 'ink' }, null, 5000).correct).toBe(false);
  });
});

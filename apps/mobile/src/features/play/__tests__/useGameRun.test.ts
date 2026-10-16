import { GAMES } from '@mindtier/core';
import { act, renderHook } from '@testing-library/react-native';
import { useGameRun } from '../useGameRun';

describe('useGameRun', () => {
  it('walks every trial, records feedback and finishes', async () => {
    const def = GAMES.flank;
    const { result } = await renderHook(() => useGameRun<any, any>(def, { mode: 'ranked', seed: 'hook', rating: 1300 }));
    expect(result.current.index).toBe(0);
    expect(result.current.total).toBe(def.trialCount);
    for (let i = 0; i < def.trialCount; i++) {
      const keyBefore = result.current.trialKey;
      await act(() => result.current.openInput());
      expect(result.current.inputOpenedAt).not.toBeNull();
      await act(() => {
        result.current.answer(def.solve(result.current.trial));
      });
      expect(result.current.feedback).toBe('correct');
      await act(() => result.current.advance());
      if (i < def.trialCount - 1) expect(result.current.trialKey).toBe(keyBefore + 1);
    }
    expect(result.current.done).toBe(true);
    expect(result.current.trial).toBeNull();
    expect(result.current.summary().accuracy).toBe(1);
  });

  it('ignores double answers for the same trial', async () => {
    const def = GAMES.spot;
    const { result } = await renderHook(() => useGameRun<any, any>(def, { mode: 'ranked', seed: 'double' }));
    await act(() => result.current.openInput());
    let second: unknown;
    await act(() => {
      result.current.answer(def.solve(result.current.trial));
      second = result.current.answer(def.solve(result.current.trial));
    });
    expect(second).toBeNull();
    await act(() => result.current.advance());
    expect(result.current.index).toBe(1);
  });

  it('records a timeout as a miss past the limit', async () => {
    const def = GAMES.snap;
    const { result } = await renderHook(() => useGameRun<any, any>(def, { mode: 'ranked', seed: 'timeout' }));
    await act(() => result.current.openInput());
    let record: any;
    await act(() => {
      record = result.current.answer(null);
    });
    expect(record.rtMs).toBeGreaterThan(def.timeLimitMs(record.level)!);
  });

  it('restarts the current trial without consuming it', async () => {
    const def = GAMES.pattern;
    const { result } = await renderHook(() => useGameRun<any, any>(def, { mode: 'ranked', seed: 'pause' }));
    const trial = result.current.trial;
    await act(() => result.current.openInput());
    await act(() => result.current.restartTrial());
    expect(result.current.index).toBe(0);
    expect(result.current.inputOpenedAt).toBeNull();
    expect(result.current.trial).toEqual(trial);
  });
});

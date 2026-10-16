import { GAMES, GAME_IDS, Rng, buildTrial, flankAnswer, type FlankTrial, type PatternTrial } from '@mindtier/core';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { ThemeProvider } from '@/theme';
import { GameStage } from '../views';

jest.useFakeTimers();

function stage(gameId: (typeof GAME_IDS)[number], trial: unknown, onAnswer = jest.fn(), onInputOpen = jest.fn()) {
  return render(
    <ThemeProvider preference="dark">
      <GameStage gameId={gameId} trial={trial} level={3} onAnswer={onAnswer} onInputOpen={onInputOpen} locked={false} shapeMode={false} reduceMotion />
    </ThemeProvider>,
  );
}

describe('game views', () => {
  it.each(GAME_IDS)('%s renders at low, mid and max level', async (id) => {
    const def = GAMES[id];
    for (const level of [1, Math.ceil(def.maxLevel / 2), def.maxLevel]) {
      const trial = buildTrial(def, 'smoke', 0, level);
      const r = await stage(id, trial);
      expect(r.toJSON()).toBeTruthy();
      await r.unmount();
    }
  });

  it('flank answers with the tapped direction', async () => {
    const trial = buildTrial<FlankTrial>(GAMES.flank, 'f', 0, 2);
    const onAnswer = jest.fn();
    await stage('flank', trial, onAnswer);
    await fireEvent.press(screen.getByTestId(flankAnswer(trial) === 'left' ? 'choice-0' : 'choice-1'));
    expect(onAnswer).toHaveBeenCalledWith(flankAnswer(trial));
  });

  it('pattern answers with the chosen option index', async () => {
    const trial = buildTrial<PatternTrial>(GAMES.pattern, 'p', 0, 1);
    const onAnswer = jest.fn();
    await stage('pattern', trial, onAnswer);
    await fireEvent.press(screen.getByTestId(`option-${trial.answerIndex}`));
    expect(onAnswer).toHaveBeenCalledWith(trial.answerIndex);
  });

  it('quick sum submits the typed number', async () => {
    const trial = { tokens: ['12', '+', '7'], answer: 19 };
    const onAnswer = jest.fn();
    await stage('quick-sum', trial, onAnswer);
    await fireEvent.press(screen.getByTestId('key-1'));
    await fireEvent.press(screen.getByTestId('key-9'));
    await fireEvent.press(screen.getByTestId('key-ok'));
    expect(onAnswer).toHaveBeenCalledWith(19);
  });

  it('grid recall opens input after the reveal and answers after enough taps', async () => {
    const trial = { size: 3, cells: [0, 4, 8], showMs: 1000 };
    const onAnswer = jest.fn();
    const onInputOpen = jest.fn();
    await stage('grid-recall', trial, onAnswer, onInputOpen);
    expect(onInputOpen).not.toHaveBeenCalled();
    await act(() => jest.advanceTimersByTime(1400));
    expect(onInputOpen).toHaveBeenCalled();
    for (const c of trial.cells) await fireEvent.press(screen.getByTestId(`cell-${c}`));
    expect(onAnswer).toHaveBeenCalledWith([0, 4, 8]);
  });

  it('echo submits one press flag per symbol at the end of the stream', async () => {
    const trial = GAMES.echo.generate(new Rng('echo'), 1);
    const onAnswer = jest.fn();
    await stage('echo', trial, onAnswer);
    await act(() => jest.advanceTimersByTime(700 + trial.symbols.length * trial.intervalMs + 10));
    expect(onAnswer).toHaveBeenCalledTimes(1);
    expect(onAnswer.mock.calls[0][0]).toHaveLength(trial.symbols.length);
  });
});

import type { GameId } from '@mindtier/core';
import type { ComponentType } from 'react';

/** Props every game view receives from the host. */
export interface GameViewProps<TTrial = any, TResponse = any> {
  trial: TTrial;
  level: number;
  /** Tell the host the player may answer now (starts the response clock). */
  onInputOpen(): void;
  /** Submit the player's answer (null = gave up / timed out). */
  onAnswer(response: TResponse | null): void;
  /** True once an answer was submitted; views should ignore further input. */
  locked: boolean;
  /** Colour-blind-friendly rendering for colour-based games. */
  shapeMode: boolean;
  reduceMotion: boolean;
  /** Tutorial demo: the view may render the solution highlighted. */
  demo?: boolean;
}

export type GameView = ComponentType<GameViewProps>;

export type GameViewRegistry = Record<GameId, GameView>;

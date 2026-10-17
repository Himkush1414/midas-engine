import type { GameId } from '@mindtier/core';
import type { GameViewProps } from '../types';
import { BalanceView } from './BalanceView';
import { ClashView } from './ClashView';
import { EchoView } from './EchoView';
import { EstimateView } from './EstimateView';
import { FlankView } from './FlankView';
import { GridRecallView } from './GridRecallView';
import { MatchView } from './MatchView';
import { MisfitView } from './MisfitView';
import { PathTraceView } from './PathTraceView';
import { PatternView } from './PatternView';
import { QuickSumView } from './QuickSumView';
import { RouteView } from './RouteView';
import { SnapView } from './SnapView';
import { SortView } from './SortView';
import { SpotView } from './SpotView';

/** Renders the view for a game. A static switch keeps component identity stable. */
export function GameStage({ gameId, ...props }: GameViewProps & { gameId: GameId }) {
  switch (gameId) {
    case 'grid-recall':
      return <GridRecallView {...props} />;
    case 'path-trace':
      return <PathTraceView {...props} />;
    case 'echo':
      return <EchoView {...props} />;
    case 'flank':
      return <FlankView {...props} />;
    case 'clash':
      return <ClashView {...props} />;
    case 'spot':
      return <SpotView {...props} />;
    case 'snap':
      return <SnapView {...props} />;
    case 'match':
      return <MatchView {...props} />;
    case 'pattern':
      return <PatternView {...props} />;
    case 'balance':
      return <BalanceView {...props} />;
    case 'route':
      return <RouteView {...props} />;
    case 'quick-sum':
      return <QuickSumView {...props} />;
    case 'estimate':
      return <EstimateView {...props} />;
    case 'sort':
      return <SortView {...props} />;
    case 'misfit':
      return <MisfitView {...props} />;
  }
}

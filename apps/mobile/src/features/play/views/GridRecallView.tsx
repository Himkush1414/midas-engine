import type { GridRecallTrial } from '@mindtier/core';
import { useEffect, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { PressableScale, Text } from '@/components/ui';
import { haptic } from '@/lib/feedback';
import { radii, spacing, useTheme } from '@/theme';
import { useT } from '@/i18n';
import type { GameViewProps } from '../types';

export function GridRecallView({ trial, onInputOpen, onAnswer, locked, demo }: GameViewProps<GridRecallTrial, number[]>) {
  const { colors } = useTheme();
  const t = useT();
  const { width } = useWindowDimensions();
  const [phase, setPhase] = useState<'show' | 'recall'>('show');
  const [taps, setTaps] = useState<number[]>([]);
  const lit = new Set(trial.cells);

  useEffect(() => {
    if (demo) return;
    const t = setTimeout(() => {
      setPhase('recall');
      onInputOpen();
    }, trial.showMs + 350);
    return () => clearTimeout(t);
  }, [trial, onInputOpen, demo]);

  const boardSize = Math.min(width - spacing.lg * 2, 360);
  const gap = trial.size >= 6 ? 6 : 8;
  const cell = (boardSize - gap * (trial.size - 1)) / trial.size;

  const tap = (i: number) => {
    if (phase !== 'recall' || locked || taps.includes(i)) return;
    haptic.tap();
    const next = [...taps, i];
    setTaps(next);
    if (next.length === trial.cells.length) onAnswer(next);
  };

  const showAnswer = locked || demo;

  return (
    <View style={styles.root}>
      <Text variant="label" tone="muted" align="center" accessibilityLiveRegion="polite">
        {phase === 'show' ? t('play.memorise') : t('play.tapMore', { count: trial.cells.length - taps.length })}
      </Text>
      <View style={[styles.board, { width: boardSize, height: boardSize, gap }]}>
        {Array.from({ length: trial.size }, (_, r) => (
          <View key={r} style={[styles.row, { gap }]}>
            {Array.from({ length: trial.size }, (_, c) => {
              const i = r * trial.size + c;
              const isLit = lit.has(i);
              const tapped = taps.includes(i);
              const visibleLit = (phase === 'show' || demo) && isLit;
              let bg = colors.surfaceRaised;
              let border = colors.border;
              if (visibleLit) bg = colors.primary;
              if (tapped) bg = isLit || !showAnswer ? colors.primary : colors.danger;
              if (showAnswer && isLit && !tapped) border = colors.success;
              return (
                <PressableScale
                  key={i}
                  testID={`cell-${i}`}
                  hapticOnPress={false}
                  pressedScale={0.92}
                  disabled={phase !== 'recall' || locked}
                  onPress={() => tap(i)}
                  accessibilityLabel={`Row ${r + 1}, column ${c + 1}${tapped ? ', selected' : ''}`}
                  style={[styles.cell, { width: cell, height: cell, backgroundColor: bg, borderColor: border }]}
                />
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', gap: spacing.xl, paddingTop: spacing.xl },
  board: { justifyContent: 'center' },
  row: { flexDirection: 'row' },
  cell: { borderRadius: radii.md, borderWidth: 2 },
});

import type { RouteTrial } from '@mindtier/core';
import { useEffect } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { PressableScale, Text } from '@/components/ui';
import { domainColors, radii, spacing, useTheme } from '@/theme';
import type { GameViewProps } from '../types';

const LABELS = ['A', 'B', 'C', 'D'] as const;
const ROTATION = [0, 90, 180, 270] as const;

function ArrowGlyph({ dir, size, color }: { dir: number; size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={{ transform: [{ rotate: `${ROTATION[dir as 0] ?? 0}deg` }] }}>
      <Path d="M12 19V6M6.5 11.5 12 6l5.5 5.5" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

export function RouteView({ trial, onInputOpen, onAnswer, locked, demo }: GameViewProps<RouteTrial, number>) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  useEffect(() => {
    onInputOpen();
  }, [onInputOpen]);

  const board = Math.min(width - spacing.lg * 2, 370);
  const gap = 4;
  const cell = (board - gap * (trial.size - 1)) / trial.size;
  const optionAt = new Map(trial.options.map((cellIndex, i) => [cellIndex, i]));

  return (
    <View style={styles.root}>
      <Text variant="label" tone="muted" align="center">
        From the glowing tile, follow {trial.steps} arrows. Where do you land?
      </Text>
      <View style={{ width: board, gap }}>
        {Array.from({ length: trial.size }, (_, r) => (
          <View key={r} style={[styles.row, { gap }]}>
            {Array.from({ length: trial.size }, (_, c) => {
              const i = r * trial.size + c;
              const isStart = i === trial.start;
              const option = optionAt.get(i);
              const isAnswer = option === trial.answerIndex;
              const border = isStart
                ? domainColors.logic
                : option !== undefined
                  ? (demo || locked) && isAnswer
                    ? colors.success
                    : colors.primaryText
                  : colors.border;
              const content = (
                <>
                  <ArrowGlyph dir={trial.arrows[i] ?? 0} size={cell * 0.5} color={isStart ? domainColors.logic : colors.textMuted} />
                  {option !== undefined ? (
                    <View style={[styles.tag, { backgroundColor: colors.primary }]}>
                      <Text variant="caption" weight="bold" style={{ color: colors.onPrimary }}>
                        {LABELS[option]}
                      </Text>
                    </View>
                  ) : null}
                </>
              );
              const style = [
                styles.cell,
                {
                  width: cell,
                  height: cell,
                  borderColor: border,
                  backgroundColor: isStart ? `${domainColors.logic}26` : colors.surface,
                  borderWidth: isStart || option !== undefined ? 2 : 1,
                },
              ];
              return option !== undefined ? (
                <PressableScale
                  key={i}
                  testID={`route-option-${option}`}
                  disabled={locked}
                  onPress={() => onAnswer(option)}
                  accessibilityLabel={`Option ${LABELS[option]}`}
                  style={style}
                >
                  {content}
                </PressableScale>
              ) : (
                <View key={i} style={style} accessibilityLabel={isStart ? 'Start tile' : undefined}>
                  {content}
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', gap: spacing.lg, paddingTop: spacing.md },
  row: { flexDirection: 'row' },
  cell: { borderRadius: radii.sm, alignItems: 'center', justifyContent: 'center' },
  tag: { position: 'absolute', top: 2, right: 2, minWidth: 18, paddingHorizontal: 4, borderRadius: 6, alignItems: 'center' },
});

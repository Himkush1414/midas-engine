import type { SpotTrial } from '@mindtier/core';
import { useEffect } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { PressableScale, Text } from '@/components/ui';
import { radii, spacing, useTheme } from '@/theme';
import { useT } from '@/i18n';
import type { GameViewProps } from '../types';

/** Landolt C: a ring with a gap; orientation in 45° steps, 0 = gap at the top, clockwise. */
export function ringPath(gapDegrees = 40): string {
  const r = 34;
  const toXY = (deg: number) => {
    const rad = (deg * Math.PI) / 180;
    return `${(50 + r * Math.cos(rad)).toFixed(2)} ${(50 + r * Math.sin(rad)).toFixed(2)}`;
  };
  // Gap centred on -90° (top). Draw the long way round, clockwise.
  return `M ${toXY(-90 + gapDegrees / 2)} A ${r} ${r} 0 1 1 ${toXY(-90 - gapDegrees / 2)}`;
}

const RING = ringPath();

function Ring({ orientation, size, color }: { orientation: number; size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Path d={RING} stroke={color} strokeWidth={11} strokeLinecap="butt" fill="none" transform={`rotate(${orientation * 45} 50 50)`} />
    </Svg>
  );
}

export function SpotView({ trial, onInputOpen, onAnswer, locked, demo }: GameViewProps<SpotTrial, number>) {
  const { colors } = useTheme();
  const t = useT();
  const { width } = useWindowDimensions();
  useEffect(() => {
    onInputOpen();
  }, [onInputOpen]);

  const board = Math.min(width - spacing.lg * 2, 380);
  const gap = 6;
  const cell = (board - gap * (trial.cols - 1)) / trial.cols;

  return (
    <View style={styles.root}>
      <Text variant="label" tone="muted" align="center">
        {t('play.spotAsk')}
      </Text>
      <View style={{ width: board, gap }}>
        {Array.from({ length: trial.rows }, (_, r) => (
          <View key={r} style={[styles.row, { gap }]}>
            {Array.from({ length: trial.cols }, (_, c) => {
              const i = r * trial.cols + c;
              const odd = i === trial.oddIndex;
              return (
                <PressableScale
                  key={i}
                  testID={`ring-${i}`}
                  hapticOnPress={false}
                  pressedScale={0.9}
                  disabled={locked}
                  onPress={() => onAnswer(i)}
                  accessibilityLabel={t('a11y.ring', { n: i + 1 })}
                  style={[
                    styles.cell,
                    {
                      width: cell,
                      height: cell,
                      backgroundColor: colors.surface,
                      borderColor: (locked || demo) && odd ? colors.success : 'transparent',
                    },
                  ]}
                >
                  <Ring orientation={odd ? trial.odd : trial.base} size={cell * 0.78} color={colors.text} />
                </PressableScale>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', gap: spacing.xl, paddingTop: spacing.lg },
  row: { flexDirection: 'row' },
  cell: { borderRadius: radii.md, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
});

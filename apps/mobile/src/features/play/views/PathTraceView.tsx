import type { PathTraceTrial } from '@mindtier/core';
import { useEffect, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { PressableScale, Text } from '@/components/ui';
import { haptic } from '@/lib/feedback';
import { radii, spacing, useTheme } from '@/theme';
import { useT } from '@/i18n';
import type { GameViewProps } from '../types';

const GAP_MS = 180;

export function PathTraceView({ trial, onInputOpen, onAnswer, locked, demo }: GameViewProps<PathTraceTrial, number[]>) {
  const { colors } = useTheme();
  const t = useT();
  const { width } = useWindowDimensions();
  const [flashIndex, setFlashIndex] = useState(-1);
  const [phase, setPhase] = useState<'watch' | 'repeat'>('watch');
  const [taps, setTaps] = useState<number[]>([]);

  useEffect(() => {
    if (demo) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const step = trial.stepMs + GAP_MS;
    trial.sequence.forEach((_, i) => {
      timers.push(setTimeout(() => setFlashIndex(i), 500 + i * step));
      timers.push(setTimeout(() => setFlashIndex(-1), 500 + i * step + trial.stepMs));
    });
    timers.push(
      setTimeout(() => {
        setPhase('repeat');
        onInputOpen();
      }, 500 + trial.sequence.length * step + 150),
    );
    return () => timers.forEach(clearTimeout);
  }, [trial, onInputOpen, demo]);

  const boardSize = Math.min(width - spacing.lg * 2, 340);
  const gap = 10;
  const cell = (boardSize - gap * (trial.size - 1)) / trial.size;
  const flashing = flashIndex >= 0 ? trial.sequence[flashIndex] : undefined;
  const expected = trial.reverse ? trial.sequence.slice().reverse() : trial.sequence;

  const tap = (i: number) => {
    if (phase !== 'repeat' || locked) return;
    haptic.tap();
    const next = [...taps, i];
    setTaps(next);
    // End early on the first mistake, or when the sequence is complete.
    if (next[next.length - 1] !== expected[next.length - 1] || next.length === expected.length) onAnswer(next);
  };

  const instruction =
    phase === 'watch' ? t('play.watchOrder') : trial.reverse ? t('play.reverseOrder') : t('play.sameOrder');

  return (
    <View style={styles.root}>
      <Text
        variant="label"
        tone={trial.reverse && phase === 'repeat' ? 'warning' : 'muted'}
        align="center"
        accessibilityLiveRegion="polite"
      >
        {instruction}
      </Text>
      <View style={{ width: boardSize, gap }}>
        {Array.from({ length: trial.size }, (_, r) => (
          <View key={r} style={[styles.row, { gap }]}>
            {Array.from({ length: trial.size }, (_, c) => {
              const i = r * trial.size + c;
              const order = taps.indexOf(i);
              const lit = flashing === i || (demo && trial.sequence.includes(i));
              return (
                <PressableScale
                  key={i}
                  testID={`tile-${i}`}
                  hapticOnPress={false}
                  pressedScale={0.9}
                  disabled={phase !== 'repeat' || locked}
                  onPress={() => tap(i)}
                  accessibilityLabel={t('a11y.tile', { n: i + 1 })}
                  style={[
                    styles.tile,
                    {
                      width: cell,
                      height: cell,
                      backgroundColor: lit ? colors.accent : order >= 0 ? colors.primary : colors.surfaceRaised,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  {order >= 0 ? (
                    <Text variant="heading" style={{ color: colors.onPrimary }}>
                      {order + 1}
                    </Text>
                  ) : demo && trial.sequence.includes(i) ? (
                    <Text variant="heading" tone="inverse">
                      {expected.indexOf(i) + 1}
                    </Text>
                  ) : null}
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
  root: { flex: 1, alignItems: 'center', gap: spacing.xl, paddingTop: spacing.xl },
  row: { flexDirection: 'row' },
  tile: { borderRadius: radii.lg, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
});

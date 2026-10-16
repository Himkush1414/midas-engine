import type { SnapTrial } from '@mindtier/core';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { Text } from '@/components/ui';
import { radii, spacing, useTheme } from '@/theme';
import { useT } from '@/i18n';
import type { GameViewProps } from '../types';
import { Shape } from './shapes';

/** Target is always the teal circle; lure colours stay distinguishable without relying on red/green. */
export const SNAP_COLORS = ['#2DD4BF', '#38BDF8', '#F59E0B'] as const;
/** Shape ids in the shared shape set: circle, square, triangle, diamond. */
const SNAP_SHAPES = [0, 1, 2, 5] as const;

export function SnapView({ trial, onInputOpen, onAnswer, locked, reduceMotion, demo }: GameViewProps<SnapTrial, boolean>) {
  const { colors } = useTheme();
  const t = useT();
  const [shown, setShown] = useState(Boolean(demo));
  const [falseStart, setFalseStart] = useState(false);

  useEffect(() => {
    if (demo) return;
    const timer = setTimeout(() => {
      setShown(true);
      onInputOpen();
    }, trial.delayMs);
    return () => clearTimeout(timer);
  }, [trial, onInputOpen, demo]);

  const tap = () => {
    if (locked) return;
    if (!shown) {
      // Tapping before anything appears doesn't count — just a gentle nudge.
      setFalseStart(true);
      return;
    }
    onAnswer(true);
  };

  return (
    <Pressable
      testID="snap-area"
      onPressIn={tap}
      style={[styles.area, { backgroundColor: colors.surface, borderColor: colors.border }]}
      accessibilityRole="button"
      accessibilityLabel={shown ? (trial.go ? t('a11y.snapTarget') : t('a11y.snapLure')) : t('a11y.snapWait')}
    >
      <Text variant="label" tone="muted" align="center" style={styles.hint}>
        {falseStart && !shown ? t('play.snapEarly') : t('play.snapHint')}
      </Text>
      <View style={styles.center}>
        {shown ? (
          <Animated.View entering={reduceMotion ? undefined : ZoomIn.duration(80)}>
            <Shape id={SNAP_SHAPES[trial.shape] ?? 0} size={150} color={SNAP_COLORS[trial.color] ?? SNAP_COLORS[0]} />
          </Animated.View>
        ) : (
          <View style={[styles.fixation, { backgroundColor: colors.textFaint }]} />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  area: { flex: 1, borderRadius: radii.xl, borderWidth: 1, marginBottom: spacing.lg, overflow: 'hidden' },
  hint: { marginTop: spacing.lg, paddingHorizontal: spacing.lg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  fixation: { width: 10, height: 10, borderRadius: 5 },
});

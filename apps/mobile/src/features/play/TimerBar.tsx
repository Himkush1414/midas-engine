import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, ReduceMotion, cancelAnimation, interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SLANT_DEG, useTheme } from '@/theme';

export interface TimerBarProps {
  /** Total window in ms; null hides the bar (untimed). */
  durationMs: number | null;
  /** performance.now() when the window opened, null while waiting. */
  startedAt: number | null;
  /** Freeze the bar (after answering). */
  frozen: boolean;
  onExpire(): void;
}

const now = () => (globalThis.performance?.now ? globalThis.performance.now() : Date.now());

export function TimerBar({ durationMs, startedAt, frozen, onExpire }: TimerBarProps) {
  const { colors } = useTheme();
  const remaining = useSharedValue(1);

  useEffect(() => {
    if (durationMs === null) return;
    if (startedAt === null) {
      remaining.set(1);
      return;
    }
    if (frozen) {
      cancelAnimation(remaining);
      return;
    }
    const elapsed = Math.max(0, now() - startedAt);
    const left = Math.max(0, durationMs - elapsed);
    remaining.set(left / durationMs);
    // The countdown is information, not decoration: it must animate even with reduced motion.
    remaining.set(withTiming(0, { duration: left, easing: Easing.linear, reduceMotion: ReduceMotion.Never }));
    const timeout = setTimeout(onExpire, left + 16);
    return () => clearTimeout(timeout);
  }, [durationMs, startedAt, frozen, onExpire, remaining]);

  const fill = useAnimatedStyle(() => ({
    width: `${remaining.get() * 100}%`,
    backgroundColor: interpolateColor(remaining.get(), [0, 0.25, 0.5, 1], [colors.danger, colors.spark, colors.success, colors.success]),
  }));

  if (durationMs === null) return <View style={styles.placeholder} />;
  return (
    <View style={[styles.track, { backgroundColor: colors.surfaceSunken }]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Animated.View style={[styles.fill, fill]} />
    </View>
  );
}

// The clock drains volt → spark → flare along a slanted bar.
const styles = StyleSheet.create({
  track: { height: 8, marginHorizontal: 2, borderRadius: 1, overflow: 'hidden', transform: [{ skewX: `${SLANT_DEG}deg` }] },
  fill: { height: '100%' },
  placeholder: { height: 8 },
});

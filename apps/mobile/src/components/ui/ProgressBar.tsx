import { useEffect } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, type SharedValue } from 'react-native-reanimated';
import { useReduceMotion } from '@/lib/motion';
import { durations, radii, SLANT_DEG, useTheme } from '@/theme';

export interface ProgressBarProps {
  /** 0..1 */
  value: number;
  color?: string;
  height?: number;
  /** Split the bar into this many slanted segments (the Floodlight motif). 1 = one continuous bar. */
  segments?: number;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

function Segment({ index, count, progress, color }: { index: number; count: number; progress: SharedValue<number>; color: string }) {
  const fill = useAnimatedStyle(() => {
    const local = Math.max(0, Math.min(1, progress.get() * count - index));
    return { width: `${local * 100}%` };
  });
  return <Animated.View style={[styles.fill, { backgroundColor: color }, fill]} />;
}

/** A slanted, optionally segmented progress bar that fills on the UI thread. */
export function ProgressBar({ value, color, height = 10, segments = 1, style, accessibilityLabel }: ProgressBarProps) {
  const { colors } = useTheme();
  const reduce = useReduceMotion();
  const clamped = Math.max(0, Math.min(1, value));
  const progress = useSharedValue(clamped);
  useEffect(() => {
    progress.set(reduce ? clamped : withTiming(clamped, { duration: durations.slow }));
  }, [clamped, reduce, progress]);
  const count = Math.max(1, Math.round(segments));
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      style={[styles.track, { height, gap: count > 1 ? 3 : 0, paddingHorizontal: height * 0.22 }, style]}
    >
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={[styles.segment, { backgroundColor: colors.surfaceSunken }]}>
          <Segment index={i} count={count} progress={progress} color={color ?? colors.primary} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', width: '100%' },
  segment: { flex: 1, borderRadius: radii.xs / 2, overflow: 'hidden', transform: [{ skewX: `${SLANT_DEG}deg` }] },
  fill: { height: '100%' },
});

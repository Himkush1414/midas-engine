import { useEffect } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useReduceMotion } from '@/lib/motion';
import { durations, radii, useTheme } from '@/theme';

export interface ProgressBarProps {
  /** 0..1 */
  value: number;
  color?: string;
  height?: number;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export function ProgressBar({ value, color, height = 8, style, accessibilityLabel }: ProgressBarProps) {
  const { colors } = useTheme();
  const reduce = useReduceMotion();
  const clamped = Math.max(0, Math.min(1, value));
  const progress = useSharedValue(clamped);
  useEffect(() => {
    progress.set(reduce ? clamped : withTiming(clamped, { duration: durations.slow }));
  }, [clamped, reduce, progress]);
  const fill = useAnimatedStyle(() => ({ width: `${progress.get() * 100}%` }));
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      style={[styles.track, { height, backgroundColor: colors.surfaceSunken }, style]}
    >
      <Animated.View style={[styles.fill, { backgroundColor: color ?? colors.primary }, fill]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { borderRadius: radii.pill, overflow: 'hidden', width: '100%' },
  fill: { height: '100%', borderRadius: radii.pill },
});

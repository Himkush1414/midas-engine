import { useEffect, type ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from 'react-native-reanimated';
import { useReduceMotion } from '@/lib/motion';
import { durations, springs, STAGGER_MAX, STAGGER_MS } from '@/theme';

export interface EnterProps {
  children: ReactNode;
  /** Position among its siblings; sets the stagger. */
  index?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Staggered entrance from the motion language: a 24 px rise on the `enter` spring, 40 ms apart,
 * capped at eight steps. Under reduced motion the content only fades in.
 *
 * Driven by shared values rather than a layout animation (`entering`): on web, Reanimated's layout
 * animations can leave the element absolutely positioned, which pulls it out of the flow.
 * Transform and opacity never affect layout, so the final layout is there from the first frame.
 */
export function Enter({ children, index = 0, style, testID }: EnterProps) {
  const reduce = useReduceMotion();
  const progress = useSharedValue(0);
  useEffect(() => {
    const delay = Math.min(index, STAGGER_MAX) * STAGGER_MS;
    progress.set(reduce ? withTiming(1, { duration: durations.flash }) : withDelay(delay, withSpring(1, springs.enter)));
  }, [index, reduce, progress]);
  const motion = useAnimatedStyle(() => ({
    opacity: Math.min(1, progress.get() * 1.5),
    transform: [{ translateY: reduce ? 0 : (1 - progress.get()) * 24 }],
  }));
  return (
    <Animated.View style={[style, motion]} testID={testID}>
      {children}
    </Animated.View>
  );
}

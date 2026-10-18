import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
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
 */
export function Enter({ children, index = 0, style, testID }: EnterProps) {
  const reduce = useReduceMotion();
  const delay = Math.min(index, STAGGER_MAX) * STAGGER_MS;
  const entering = reduce
    ? FadeIn.duration(durations.flash)
    : FadeInDown.withInitialValues({ transform: [{ translateY: 24 }], opacity: 0 })
        .springify()
        .damping(springs.enter.damping)
        .stiffness(springs.enter.stiffness)
        .mass(springs.enter.mass)
        .delay(delay);
  return (
    <Animated.View entering={entering} style={style} testID={testID}>
      {children}
    </Animated.View>
  );
}

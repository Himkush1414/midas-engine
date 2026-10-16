import type { ReactNode } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { haptic } from '@/lib/feedback';
import { useReduceMotion } from '@/lib/motion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface PressableScaleProps extends Omit<PressableProps, 'style' | 'children'> {
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  /** Scale while pressed. */
  pressedScale?: number;
  hapticOnPress?: boolean;
}

/** Pressable with a springy press-in scale and an optional selection haptic. */
export function PressableScale({
  style,
  children,
  pressedScale = 0.97,
  hapticOnPress = true,
  onPressIn,
  onPressOut,
  onPress,
  disabled,
  ...rest
}: PressableScaleProps) {
  const reduce = useReduceMotion();
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
  return (
    <AnimatedPressable
      accessibilityRole="button"
      disabled={disabled}
      onPressIn={(e) => {
        if (!reduce) scale.set(withSpring(pressedScale, { damping: 20, stiffness: 400 }));
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.set(withSpring(1, { damping: 16, stiffness: 300 }));
        onPressOut?.(e);
      }}
      onPress={(e) => {
        if (hapticOnPress) haptic.tap();
        onPress?.(e);
      }}
      style={[animated, style]}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}

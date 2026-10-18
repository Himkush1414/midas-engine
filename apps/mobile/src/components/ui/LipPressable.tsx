import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { haptic } from '@/lib/feedback';
import { useReduceMotion } from '@/lib/motion';
import { radii, springs } from '@/theme';

export interface LipPressableProps extends Omit<PressableProps, 'style' | 'children'> {
  children?: ReactNode;
  /** Colour of the face the finger presses. */
  face: string;
  /** Colour of the solid lip under the face. */
  lipColor: string;
  /** Lip height: how far the face travels when pressed. */
  lip: number;
  radius?: number;
  /** Layout of the whole control (margins, alignment, flex). */
  style?: StyleProp<ViewStyle>;
  /** Layout inside the face (padding, height, alignment). */
  faceStyle?: StyleProp<ViewStyle>;
  hapticOnPress?: boolean;
}

/**
 * The Floodlight pressable: a face resting on a solid lip. Pressing drives the face down onto
 * the lip on the UI thread, so the press reads in under a frame; releasing springs it back.
 * Under reduced motion the face dims instead of moving.
 */
export function LipPressable({
  children,
  face,
  lipColor,
  lip,
  radius = radii.sm,
  style,
  faceStyle,
  hapticOnPress = true,
  disabled,
  onPressIn,
  onPressOut,
  onPress,
  ...rest
}: LipPressableProps) {
  const reduce = useReduceMotion();
  const pressed = useSharedValue(0);
  const faceMotion = useAnimatedStyle(() => ({
    transform: [{ translateY: reduce ? 0 : pressed.get() * lip }],
    opacity: reduce ? 1 - pressed.get() * 0.25 : 1,
  }));
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPressIn={(e) => {
        pressed.set(withSpring(1, springs.press));
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        pressed.set(withSpring(0, springs.release));
        onPressOut?.(e);
      }}
      onPress={(e) => {
        if (hapticOnPress) haptic.tap();
        onPress?.(e);
      }}
      style={[{ paddingBottom: lip }, style]}
      {...rest}
    >
      <View style={[StyleSheet.absoluteFill, { top: lip, backgroundColor: lipColor, borderRadius: radius }]} />
      <Animated.View style={[{ backgroundColor: face, borderRadius: radius }, faceStyle, faceMotion]}>{children}</Animated.View>
    </Pressable>
  );
}

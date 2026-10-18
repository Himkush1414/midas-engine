import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { lips, radii, spacing, useTheme } from '@/theme';
import { LipPressable } from './LipPressable';

export interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  /** Raised plates sit on top of other surfaces. */
  raised?: boolean;
  padded?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

/**
 * A plate on the field. Plates separate by tone, never by outline; a pressable plate stands on a
 * lip and presses down onto it.
 */
export function Card({ children, onPress, style, raised, padded = true, accessibilityLabel, accessibilityHint, testID }: CardProps) {
  const { colors } = useTheme();
  const face = raised ? colors.surfaceRaised : colors.surface;
  const surface: ViewStyle = { padding: padded ? spacing.lg : 0, borderRadius: radii.md, overflow: 'hidden' };
  if (onPress) {
    const [outer, inner] = splitLayout(style);
    return (
      <LipPressable
        testID={testID}
        onPress={onPress}
        face={face}
        lipColor={colors.lip}
        lip={lips.sm}
        radius={radii.md}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        style={outer}
        faceStyle={[surface, inner]}
      >
        {children}
      </LipPressable>
    );
  }
  return (
    <View testID={testID} accessibilityLabel={accessibilityLabel} style={[surface, { backgroundColor: face }, style]}>
      {children}
    </View>
  );
}

const OUTER_KEYS = /^(margin|flex|alignSelf|width|minWidth|maxWidth|position|top|left|right|bottom|zIndex)/;

/** Outer layout (margins, flex, size) belongs to the whole control; the rest styles the face. */
function splitLayout(style: StyleProp<ViewStyle>): [ViewStyle, ViewStyle] {
  const flat = StyleSheet.flatten(style) ?? {};
  const outer: Record<string, unknown> = {};
  const inner: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(flat)) (OUTER_KEYS.test(key) ? outer : inner)[key] = value;
  return [outer as ViewStyle, inner as ViewStyle];
}

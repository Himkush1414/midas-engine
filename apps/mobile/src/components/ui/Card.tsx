import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { radii, spacing, useTheme } from '@/theme';
import { PressableScale } from './PressableScale';

export interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  /** Raised cards sit on top of other surfaces. */
  raised?: boolean;
  padded?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

export function Card({ children, onPress, style, raised, padded = true, accessibilityLabel, accessibilityHint, testID }: CardProps) {
  const { colors } = useTheme();
  const surface: ViewStyle = {
    backgroundColor: raised ? colors.surfaceRaised : colors.surface,
    borderColor: colors.border,
    padding: padded ? spacing.lg : 0,
  };
  if (onPress) {
    return (
      <PressableScale
        testID={testID}
        onPress={onPress}
        pressedScale={0.985}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        style={[styles.card, surface, style]}
      >
        {children}
      </PressableScale>
    );
  }
  return (
    <View testID={testID} accessibilityLabel={accessibilityLabel} style={[styles.card, surface, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radii.xl, borderWidth: 1, overflow: 'hidden' },
});

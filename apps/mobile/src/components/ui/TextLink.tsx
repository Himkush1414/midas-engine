import { StyleSheet } from 'react-native';
import { PressableScale } from './PressableScale';
import { Text, type TextProps } from './Text';

/**
 * Inline text action (Terms, Privacy, Restore purchases). Same press feel and selection haptic as every
 * other control, and a hit slop that lifts a 16 pt caption line to a 44 pt touch target without moving layout.
 */
export function TextLink({
  label,
  onPress,
  role = 'link',
  variant = 'caption',
  tone = 'primary',
  testID,
}: {
  label: string;
  onPress(): void;
  role?: 'link' | 'button';
  variant?: TextProps['variant'];
  tone?: TextProps['tone'];
  testID?: string;
}) {
  return (
    <PressableScale onPress={onPress} accessibilityRole={role} accessibilityLabel={label} hitSlop={HIT_SLOP} pressedScale={0.94} testID={testID} style={styles.link}>
      <Text variant={variant} tone={tone}>
        {label}
      </Text>
    </PressableScale>
  );
}

const HIT_SLOP = { top: 14, bottom: 14, left: 8, right: 8 };

const styles = StyleSheet.create({
  link: { alignSelf: 'center' },
});

import { ActivityIndicator, StyleSheet, View, useWindowDimensions, type StyleProp, type ViewStyle } from 'react-native';
import { lips, radii, spacing, useTheme } from '@/theme';
import { Icon, type IconName } from '../icons/Icon';
import { fitDisplaySize } from './fit';
import { LipPressable } from './LipPressable';
import { MAX_CONTENT_WIDTH } from './Screen';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: 'md' | 'lg';
  icon?: IconName;
  iconRight?: IconName;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
  testID?: string;
}

/**
 * Buttons speak in the display voice and stand on a lip (docs/DESIGN_DIRECTION.md §4).
 * Primary is the one volt "go" action on a screen; secondary is a raised plate; ghost is text only.
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading,
  disabled,
  fullWidth,
  style,
  accessibilityHint,
  testID,
}: ButtonProps) {
  const { colors } = useTheme();
  const palette = {
    primary: { face: colors.primary, lip: colors.primaryLip, fg: colors.onPrimary },
    secondary: { face: colors.surfaceRaised, lip: colors.lip, fg: colors.text },
    ghost: { face: 'transparent', lip: 'transparent', fg: colors.primaryText },
    danger: { face: colors.surfaceRaised, lip: colors.lip, fg: colors.danger },
  }[variant];
  const { width } = useWindowDimensions();
  const inactive = disabled || loading;
  const large = size === 'lg';
  const base = large ? 26 : 21;
  // Full-width labels shrink to fit their known width (long translations such as French trial
  // buttons); web ignores adjustsFontSizeToFit, so the size is computed, not measured.
  const iconRoom = (icon ? 30 : 0) + (iconRight ? 30 : 0);
  const room = Math.min(width, MAX_CONTENT_WIDTH) - spacing.gutter * 2 - spacing.xl * 2 - iconRoom;
  const labelSize = fullWidth ? fitDisplaySize(label.toLocaleUpperCase(), room, base, 15, 0.5) : base;
  const content = loading ? (
    <ActivityIndicator color={palette.fg} />
  ) : (
    <View style={styles.row}>
      {icon ? <Icon name={icon} size={large ? 22 : 20} color={palette.fg} /> : null}
      <Text
        variant={large ? 'heading' : 'subheading'}
        display
        weight="semibold"
        numberOfLines={1}
        adjustsFontSizeToFit
        style={[styles.label, { color: palette.fg, fontSize: labelSize, lineHeight: Math.round(labelSize * 1.15) }]}
      >
        {label}
      </Text>
      {iconRight ? <Icon name={iconRight} size={large ? 22 : 20} color={palette.fg} /> : null}
    </View>
  );
  const a11y = {
    testID,
    accessibilityLabel: label,
    accessibilityHint,
    accessibilityState: { disabled: !!inactive, busy: !!loading },
  };
  const layout = [{ alignSelf: fullWidth ? ('stretch' as const) : ('auto' as const), opacity: disabled ? 0.45 : 1 }, style];

  if (variant === 'ghost') {
    return (
      <PressableScale {...a11y} onPress={onPress} disabled={inactive} style={[styles.face, { minHeight: large ? 56 : 48 }, layout]}>
        {content}
      </PressableScale>
    );
  }
  return (
    <LipPressable
      {...a11y}
      onPress={onPress}
      disabled={inactive}
      face={palette.face}
      lipColor={palette.lip}
      lip={large ? lips.lg : lips.md}
      radius={radii.sm}
      style={layout}
      faceStyle={[styles.face, { minHeight: large ? 60 : 50 }]}
    >
      {content}
    </LipPressable>
  );
}

const styles = StyleSheet.create({
  face: { paddingHorizontal: spacing.xl, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexShrink: 1 },
  label: { letterSpacing: 0.6, flexShrink: 1 },
});

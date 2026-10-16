import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { HIT_TARGET, radii, spacing, useTheme } from '@/theme';
import { Icon, type IconName } from '../icons/Icon';
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
    primary: { bg: colors.primary, fg: colors.onPrimary, border: colors.primary },
    secondary: { bg: colors.surfaceRaised, fg: colors.text, border: colors.borderStrong },
    ghost: { bg: 'transparent', fg: colors.primaryText, border: 'transparent' },
    danger: { bg: 'transparent', fg: colors.danger, border: colors.danger },
  }[variant];
  const inactive = disabled || loading;
  const height = size === 'lg' ? 56 : HIT_TARGET;

  return (
    <PressableScale
      testID={testID}
      onPress={onPress}
      disabled={inactive}
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      style={[
        styles.base,
        {
          minHeight: height,
          backgroundColor: palette.bg,
          borderColor: palette.border,
          opacity: disabled ? 0.45 : 1,
          alignSelf: fullWidth ? 'stretch' : 'auto',
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.fg} />
      ) : (
        <View style={styles.row}>
          {icon ? <Icon name={icon} size={20} color={palette.fg} /> : null}
          <Text variant={size === 'lg' ? 'subheading' : 'body'} weight="semibold" style={{ color: palette.fg }}>
            {label}
          </Text>
          {iconRight ? <Icon name={iconRight} size={20} color={palette.fg} /> : null}
        </View>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.lg,
    borderWidth: 1.5,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});

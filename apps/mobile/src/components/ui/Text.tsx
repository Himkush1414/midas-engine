import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';
import { fonts, type, useTheme, type Palette } from '@/theme';

export type TextVariant = keyof typeof type;
export type TextTone = 'default' | 'muted' | 'faint' | 'primary' | 'accent' | 'success' | 'danger' | 'warning' | 'inverse' | 'spark';

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  tone?: TextTone;
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  align?: TextStyle['textAlign'];
  /** Use the display face (Space Grotesk) — for numbers, ranks and headlines. */
  display?: boolean;
  tabular?: boolean;
}

const toneColor = (tone: TextTone, c: Palette): string =>
  ({
    default: c.text,
    muted: c.textMuted,
    faint: c.textFaint,
    primary: c.primaryText,
    accent: c.accent,
    success: c.success,
    danger: c.danger,
    warning: c.warning,
    inverse: c.textInverse,
    spark: c.spark,
  })[tone];

const DISPLAY_VARIANTS: ReadonlySet<TextVariant> = new Set(['hero', 'title', 'heading']);

export function Text({
  variant = 'body',
  tone = 'default',
  weight,
  align,
  display,
  tabular,
  style,
  maxFontSizeMultiplier = 2,
  ...rest
}: TextProps) {
  const { colors } = useTheme();
  const [fontSize, lineHeight] = type[variant];
  const useDisplay = display ?? DISPLAY_VARIANTS.has(variant);
  const fontFamily = useDisplay
    ? weight === 'medium' || weight === 'regular'
      ? fonts.displayMedium
      : fonts.display
    : {
        regular: fonts.body,
        medium: fonts.bodyMedium,
        semibold: fonts.bodySemibold,
        bold: fonts.bodyBold,
      }[weight ?? (variant === 'label' ? 'semibold' : 'regular')];
  return (
    <RNText
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      style={[
        {
          color: toneColor(tone, colors),
          fontSize,
          lineHeight,
          fontFamily,
          textAlign: align,
          fontVariant: tabular ? ['tabular-nums'] : undefined,
        },
        style,
      ]}
      {...rest}
    />
  );
}

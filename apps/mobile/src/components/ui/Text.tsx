import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';
import { fonts, type, useTheme, type Palette } from '@/theme';

export type TextVariant = keyof typeof type;
export type TextTone = 'default' | 'muted' | 'faint' | 'primary' | 'accent' | 'success' | 'danger' | 'warning' | 'inverse' | 'spark';

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  tone?: TextTone;
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  align?: TextStyle['textAlign'];
  /** Use the display face (Big Shoulders, uppercase) — for numbers, ranks and headlines. */
  display?: boolean;
  /** Use the data face (JetBrains Mono, uppercase, tracked) — for micro-labels over numbers. */
  mono?: boolean;
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

const DISPLAY_VARIANTS: ReadonlySet<TextVariant> = new Set(['mega', 'hero', 'title', 'heading']);

/** Display text is already huge, so it scales with the system font size less than body text. */
const DISPLAY_MAX_SCALE = 1.3;

export function Text({
  variant = 'body',
  tone = 'default',
  weight,
  align,
  display,
  mono,
  tabular,
  style,
  maxFontSizeMultiplier,
  ...rest
}: TextProps) {
  const { colors } = useTheme();
  const [fontSize, lineHeight] = type[variant];
  const useMono = mono ?? variant === 'micro';
  const useDisplay = !useMono && (display ?? DISPLAY_VARIANTS.has(variant));
  const fontFamily = useMono
    ? weight === 'bold' || weight === 'semibold'
      ? fonts.monoBold
      : fonts.mono
    : useDisplay
      ? weight === 'medium' || weight === 'regular'
        ? fonts.displayMedium
        : weight === 'semibold'
          ? fonts.displayBold
          : fonts.display
      : {
          regular: fonts.body,
          medium: fonts.bodyMedium,
          semibold: fonts.bodySemibold,
          bold: fonts.bodyBold,
        }[weight ?? (variant === 'label' ? 'semibold' : 'regular')];
  return (
    <RNText
      maxFontSizeMultiplier={maxFontSizeMultiplier ?? (useDisplay ? DISPLAY_MAX_SCALE : 2)}
      style={[
        {
          color: toneColor(tone, colors),
          fontSize,
          lineHeight,
          fontFamily,
          textAlign: align,
          fontVariant: tabular ? ['tabular-nums'] : undefined,
        },
        useDisplay && styles.display,
        useMono && styles.mono,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = {
  display: { textTransform: 'uppercase', letterSpacing: 0.2 } satisfies TextStyle,
  mono: { textTransform: 'uppercase', letterSpacing: 1.3 } satisfies TextStyle,
};

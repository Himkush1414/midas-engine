import { memo, useEffect } from 'react';
import { StyleSheet, View, type TextStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { useReduceMotion } from '@/lib/motion';
import { type } from '@/theme';
import { Text, type TextProps } from './Text';

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const ROLL_MS = 700;
const DIGIT_STAGGER_MS = 60;

const Digit = memo(function Digit({
  digit,
  height,
  delay,
  textProps,
}: {
  digit: number;
  height: number;
  delay: number;
  textProps: TextProps;
}) {
  const reduce = useReduceMotion();
  const y = useSharedValue(reduce ? -digit * height : 0);
  useEffect(() => {
    const target = -digit * height;
    y.set(reduce ? target : withDelay(delay, withTiming(target, { duration: ROLL_MS, easing: Easing.out(Easing.exp) })));
  }, [digit, height, delay, reduce, y]);
  const strip = useAnimatedStyle(() => ({ transform: [{ translateY: y.get() }] }));
  // The column takes the width of its final digit (an invisible copy sizes it), so a narrow "1"
  // doesn't leave a gap; the strip is centred in it and clipped while it rolls past wider digits.
  return (
    <View style={{ height, overflow: 'hidden' }}>
      <Text {...textProps} accessible={false} style={[textProps.style, { height, lineHeight: height, opacity: 0 }]}>
        {DIGITS[digit]}
      </Text>
      <Animated.View style={[styles.strip, strip]}>
        {DIGITS.map((d) => (
          <Text key={d} {...textProps} accessible={false} style={[textProps.style, { height, lineHeight: height }]}>
            {d}
          </Text>
        ))}
      </Animated.View>
    </View>
  );
});

export interface RollingNumberProps extends Omit<TextProps, 'children'> {
  /** Already formatted value, e.g. "1,605" or "+14". Digits roll; other characters stay put. */
  value: string;
}

/**
 * A number whose digits roll into place on their own strips (the motion language's `roll`).
 * Each column is sized by its final digit, so the layout is final from the first frame.
 * Screen readers get the final value; under reduced motion the digits simply show it.
 */
export function RollingNumber({ value, variant = 'body', style, accessibilityLabel, ...rest }: RollingNumberProps) {
  const flat = StyleSheet.flatten(style) as TextStyle | undefined;
  const height = flat?.lineHeight ?? flat?.fontSize ?? type[variant][1];
  const textProps: TextProps = { ...rest, variant, style };
  const chars = [...value];
  let digitIndex = 0;
  return (
    <View accessible accessibilityRole="text" accessibilityLabel={accessibilityLabel ?? value} style={styles.row}>
      {chars.map((c, i) => {
        const n = DIGITS.indexOf(c);
        if (n < 0) {
          return (
            <Text key={`s${i}`} {...textProps} accessible={false} style={[style, { height, lineHeight: height }]}>
              {c}
            </Text>
          );
        }
        // Key digits from the right so a growing number keeps its units column stable.
        const fromRight = chars.length - i;
        return <Digit key={`d${fromRight}`} digit={n} height={height} delay={digitIndex++ * DIGIT_STAGGER_MS} textProps={textProps} />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  strip: { position: 'absolute', top: 0, left: -40, right: -40, alignItems: 'center' },
});

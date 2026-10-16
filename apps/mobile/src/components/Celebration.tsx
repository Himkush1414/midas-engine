import { useEffect } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

const COUNT = 28;

function Particle({ i, color, width }: { i: number; color: string; width: number }) {
  const t = useSharedValue(0);
  const angle = (i / COUNT) * Math.PI * 2 + (i % 3) * 0.3;
  const distance = 120 + (i % 5) * 26;
  useEffect(() => {
    t.set(withDelay((i % 4) * 40, withTiming(1, { duration: 1100, easing: Easing.out(Easing.cubic) })));
  }, [i, t]);
  const style = useAnimatedStyle(() => ({
    opacity: 1 - t.get(),
    transform: [
      { translateX: Math.cos(angle) * distance * t.get() },
      { translateY: Math.sin(angle) * distance * t.get() + 60 * t.get() * t.get() },
      { rotate: `${t.get() * 360}deg` },
      { scale: 1 - t.get() * 0.4 },
    ],
  }));
  const size = 6 + (i % 3) * 3;
  return (
    <Animated.View
      style={[
        styles.particle,
        { left: width / 2 - size / 2, width: size, height: i % 2 ? size : size * 1.8, backgroundColor: color, borderRadius: i % 2 ? size : 2 },
        style,
      ]}
    />
  );
}

/** One-shot burst for rank-ups. Renders nothing when motion is reduced. */
export function Celebration({ colors, reduceMotion, top = 120 }: { colors: string[]; reduceMotion: boolean; top?: number }) {
  const { width } = useWindowDimensions();
  if (reduceMotion) return null;
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { top }]}>
      {Array.from({ length: COUNT }, (_, i) => (
        <Particle key={i} i={i} color={colors[i % colors.length] ?? '#FFFFFF'} width={width} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  particle: { position: 'absolute', top: 0 },
});

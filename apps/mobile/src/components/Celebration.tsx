import { useEffect } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { durations, SLANT_DEG } from '@/theme';

/** At most this many shards (motion language: capped and gone within 1.4 s). */
const COUNT = 36;

/** Deterministic per-shard variation, so a burst looks the same on every run. */
const hash = (i: number, salt: number) => {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

function Shard({ i, color, originX }: { i: number; color: string; originX: number }) {
  const t = useSharedValue(0);
  // Fan upward and outward, then fall under gravity with a little drag.
  const angle = -Math.PI / 2 + (hash(i, 1) - 0.5) * Math.PI * 1.25;
  const speed = 180 + hash(i, 2) * 220;
  const spin = (hash(i, 3) - 0.5) * 900;
  const length = 10 + hash(i, 4) * 14;
  useEffect(() => {
    t.set(withDelay(hash(i, 5) * 90, withTiming(1, { duration: durations.ceremony, easing: Easing.out(Easing.quad) })));
  }, [i, t]);
  const style = useAnimatedStyle(() => {
    const p = t.get();
    return {
      opacity: p < 0.7 ? 1 : 1 - (p - 0.7) / 0.3,
      transform: [
        { translateX: Math.cos(angle) * speed * p },
        { translateY: Math.sin(angle) * speed * p + 420 * p * p },
        { rotate: `${spin * p}deg` },
        { skewX: `${SLANT_DEG}deg` },
      ],
    };
  });
  return <Animated.View style={[styles.shard, { left: originX - 3, width: 6, height: length, backgroundColor: color }, style]} />;
}

/** One-shot burst of slanted shards for wins, streaks and tier-ups. Renders nothing when motion is reduced. */
export function Celebration({ colors, reduceMotion, top = 120 }: { colors: string[]; reduceMotion: boolean; top?: number }) {
  const { width } = useWindowDimensions();
  if (reduceMotion) return null;
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { top }]}>
      {Array.from({ length: COUNT }, (_, i) => (
        <Shard key={i} i={i} color={colors[i % colors.length] ?? '#FFFFFF'} originX={width / 2} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  shard: { position: 'absolute', top: 0, borderRadius: 1 },
});

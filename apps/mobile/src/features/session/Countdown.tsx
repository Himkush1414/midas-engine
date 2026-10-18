import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeOut, ZoomIn } from 'react-native-reanimated';
import { Text } from '@/components/ui';
import { haptic } from '@/lib/feedback';
import { play } from '@/lib/sound';
import { SLANT_DEG, springs, useTheme } from '@/theme';

/** 3-2-1 slammed onto a slanted plate: anticipation before every timed game. */
export function Countdown({ from = 3, reduceMotion, onDone }: { from?: number; reduceMotion: boolean; onDone(): void }) {
  const { colors } = useTheme();
  const [n, setN] = useState(from);
  useEffect(() => {
    if (n === 0) {
      onDone();
      return;
    }
    haptic.tap();
    play('tick');
    const timer = setTimeout(() => setN((v) => v - 1), 650);
    return () => clearTimeout(timer);
  }, [n, onDone]);

  return (
    <View style={styles.root} accessibilityLiveRegion="assertive">
      {n > 0 ? (
        <Animated.View
          key={n}
          entering={reduceMotion ? undefined : ZoomIn.springify().damping(springs.slam.damping).stiffness(springs.slam.stiffness * 2)}
          exiting={reduceMotion ? undefined : FadeOut.duration(90)}
          style={styles.center}
        >
          <View style={[styles.plate, { backgroundColor: colors.primary }]} />
          <Text variant="mega" style={[styles.number, { color: colors.onPrimary }]} accessibilityLabel={`${n}`}>
            {n}
          </Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  center: { alignItems: 'center', justifyContent: 'center' },
  plate: { position: 'absolute', width: 170, height: 200, borderRadius: 8, transform: [{ skewX: `${SLANT_DEG}deg` }] },
  number: { fontSize: 180, lineHeight: 176, zIndex: 1 },
});

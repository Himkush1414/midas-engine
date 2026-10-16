import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { ZoomIn, ZoomOut } from 'react-native-reanimated';
import { Text } from '@/components/ui';
import { haptic } from '@/lib/feedback';

export function Countdown({ from = 3, reduceMotion, onDone }: { from?: number; reduceMotion: boolean; onDone(): void }) {
  const [n, setN] = useState(from);
  useEffect(() => {
    if (n === 0) {
      onDone();
      return;
    }
    haptic.tap();
    const t = setTimeout(() => setN((v) => v - 1), 650);
    return () => clearTimeout(t);
  }, [n, onDone]);

  return (
    <View style={styles.root} accessibilityLiveRegion="assertive">
      {n > 0 ? (
        <Animated.View key={n} entering={reduceMotion ? undefined : ZoomIn.springify()} exiting={reduceMotion ? undefined : ZoomOut.duration(120)}>
          <Text variant="hero" display style={styles.number} accessibilityLabel={`${n}`}>
            {n}
          </Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  number: { fontSize: 120, lineHeight: 130 },
});

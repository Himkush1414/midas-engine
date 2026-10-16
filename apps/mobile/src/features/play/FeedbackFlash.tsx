import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';
import { Icon } from '@/components/icons/Icon';
import { useTheme } from '@/theme';
import type { FeedbackKind } from './useGameRun';

export function FeedbackFlash({ kind, reduceMotion }: { kind: FeedbackKind; reduceMotion: boolean }) {
  const { colors } = useTheme();
  if (!kind) return null;
  const color = kind === 'correct' ? colors.success : kind === 'partial' ? colors.warning : colors.danger;
  const icon = kind === 'wrong' ? 'close' : 'check';
  return (
    <Animated.View
      pointerEvents="none"
      entering={reduceMotion ? undefined : FadeIn.duration(90)}
      exiting={reduceMotion ? undefined : FadeOut.duration(120)}
      style={StyleSheet.absoluteFill}
      accessibilityLiveRegion="polite"
      accessibilityLabel={kind === 'correct' ? 'Correct' : kind === 'partial' ? 'Partly correct' : 'Incorrect'}
    >
      <View style={[StyleSheet.absoluteFill, { backgroundColor: color, opacity: 0.08 }]} />
      <View style={styles.center}>
        <Animated.View
          entering={reduceMotion ? undefined : ZoomIn.springify().damping(14)}
          style={[styles.disc, { backgroundColor: color }]}
        >
          <Icon name={icon} size={40} color="#FFFFFF" strokeWidth={3} />
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  center: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  disc: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center', opacity: 0.92 },
});

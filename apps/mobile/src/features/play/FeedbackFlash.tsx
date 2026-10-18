import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';
import { Icon } from '@/components/icons/Icon';
import { useT } from '@/i18n';
import { durations, onColor, SLANT_DEG, springs, useTheme } from '@/theme';
import type { FeedbackKind } from './useGameRun';

/**
 * Right or wrong, stamped on the stage: a slanted plate slams in with ✓ or ✕ while the stage takes
 * a faint tint. Shape, colour, sound and haptic all differ, so colour is never the only cue.
 */
export function FeedbackFlash({ kind, reduceMotion }: { kind: FeedbackKind; reduceMotion: boolean }) {
  const { colors } = useTheme();
  const t = useT();
  if (!kind) return null;
  const color = kind === 'correct' ? colors.success : kind === 'partial' ? colors.spark : colors.danger;
  const icon = kind === 'wrong' ? 'close' : 'check';
  return (
    <Animated.View
      pointerEvents="none"
      entering={reduceMotion ? undefined : FadeIn.duration(durations.flash / 2)}
      exiting={reduceMotion ? undefined : FadeOut.duration(durations.flash)}
      style={StyleSheet.absoluteFill}
      accessibilityLiveRegion="polite"
      accessibilityLabel={kind === 'correct' ? t('play.correct') : kind === 'partial' ? t('play.partly') : t('play.incorrect')}
    >
      <View style={[StyleSheet.absoluteFill, { backgroundColor: color, opacity: 0.1 }]} />
      <View style={styles.center}>
        <Animated.View
          entering={reduceMotion ? undefined : ZoomIn.springify().damping(springs.slam.damping + 3).stiffness(springs.slam.stiffness * 2.5)}
          style={[styles.stamp, { backgroundColor: color }]}
        >
          <View style={styles.unskew}>
            <Icon name={icon} size={44} color={onColor(color)} strokeWidth={3.2} />
          </View>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  center: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  stamp: { width: 96, height: 76, borderRadius: 6, alignItems: 'center', justifyContent: 'center', transform: [{ skewX: `${SLANT_DEG}deg` }] },
  unskew: { transform: [{ skewX: `${-SLANT_DEG}deg` }] },
});

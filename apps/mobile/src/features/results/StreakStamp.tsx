import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { Icon } from '@/components/icons/Icon';
import { RollingNumber, Text } from '@/components/ui';
import { useT } from '@/i18n';
import { haptic } from '@/lib/feedback';
import { play } from '@/lib/sound';
import { radii, SLANT_DEG, spacing, springs, useTheme } from '@/theme';

/** When the stamp lands: after the rating has had its moment. */
const LAND_MS = 900;

/**
 * The streak moment: a flame stamp punches in after the rating roll, its count rolls up, and three
 * rising ticks (sound and haptic) mark it. Under reduced motion it simply appears; the ticks stay.
 */
export function StreakStamp({ days, reduceMotion }: { days: number; reduceMotion: boolean }) {
  const { colors } = useTheme();
  const t = useT();
  useEffect(() => {
    const timers = [0, 110, 220].map((offset) =>
      setTimeout(() => {
        play('tick');
        haptic.correct();
      }, LAND_MS + offset),
    );
    return () => timers.forEach(clearTimeout);
  }, []);
  return (
    <Animated.View
      entering={reduceMotion ? undefined : ZoomIn.delay(LAND_MS).springify().damping(springs.slam.damping).stiffness(springs.slam.stiffness * 1.4)}
      style={[styles.stamp, { backgroundColor: colors.surfaceRaised }]}
      accessible
      accessibilityLiveRegion="polite"
      accessibilityLabel={t('results.streak', { count: days })}
    >
      <View style={[styles.flame, { backgroundColor: colors.danger }]}>
        <View style={styles.unskew}>
          <Icon name="flame" size={26} color="#FFFFFF" strokeWidth={2.4} />
        </View>
      </View>
      <RollingNumber value={String(days)} variant="title" />
      <Text variant="micro" tone="muted" style={styles.label}>
        {t('results.streakLabel', { count: days })}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  stamp: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, alignSelf: 'flex-start', borderRadius: radii.md, padding: spacing.sm, paddingRight: spacing.lg },
  flame: { width: 48, height: 44, borderRadius: radii.xs, alignItems: 'center', justifyContent: 'center', transform: [{ skewX: `${SLANT_DEG}deg` }] },
  unskew: { transform: [{ skewX: `${-SLANT_DEG}deg` }] },
  label: { flexShrink: 1 },
});

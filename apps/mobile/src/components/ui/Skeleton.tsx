import { useEffect } from 'react';
import { StyleSheet, View, type DimensionValue } from 'react-native';
import Animated, { cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { Icon, type IconName } from '@/components/icons/Icon';
import { useT } from '@/i18n';
import { useReduceMotion } from '@/lib/motion';
import { radii, spacing, useTheme } from '@/theme';
import { Button } from './Button';
import { Text } from './Text';

/** Slow opacity breathing shared by every placeholder; still under reduced motion. */
function useBreathing() {
  const reduce = useReduceMotion();
  const pulse = useSharedValue(1);
  useEffect(() => {
    if (reduce) return;
    pulse.set(withRepeat(withTiming(0.45, { duration: 800 }), -1, true));
    return () => cancelAnimation(pulse);
  }, [reduce, pulse]);
  return useAnimatedStyle(() => ({ opacity: pulse.get() }));
}

const NAME_WIDTHS: DimensionValue[] = ['46%', '38%', '52%', '34%', '42%'];

/** Placeholder rows shaped like the list that is loading (rank, name, points), breathing slowly. */
export function SkeletonRows({ rows = 5, testID }: { rows?: number; testID?: string }) {
  const { colors } = useTheme();
  const t = useT();
  const breathe = useBreathing();
  const bar = (width: DimensionValue, height = 14) => <View style={[styles.bar, { width, height, backgroundColor: colors.surfaceSunken }]} />;
  return (
    <Animated.View style={[styles.rows, breathe]} accessible accessibilityRole="progressbar" accessibilityLabel={t('common.loading')} testID={testID}>
      {Array.from({ length: rows }, (_, i) => (
        <View key={i} style={styles.row}>
          {bar(18, 18)}
          {/* Varied name lengths so the placeholder reads as a list, not a barcode. */}
          {bar(NAME_WIDTHS[i % NAME_WIDTHS.length] ?? '40%')}
          <View style={styles.flex} />
          {bar(52)}
        </View>
      ))}
    </Animated.View>
  );
}

/** Placeholder plates shaped like a stack of option cards (e.g. paywall plans). */
export function SkeletonBlocks({ count = 3, height = 72 }: { count?: number; height?: number }) {
  const { colors } = useTheme();
  const t = useT();
  const breathe = useBreathing();
  return (
    <Animated.View style={[styles.blocks, breathe]} accessible accessibilityRole="progressbar" accessibilityLabel={t('common.loading')}>
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={[styles.block, { height, backgroundColor: colors.surface }]} />
      ))}
    </Animated.View>
  );
}

/** A quiet inline state (offline, unavailable): an icon, one line of copy and an optional retry. */
export function StatusNote({ icon = 'wifiOff', message, onRetry }: { icon?: IconName; message: string; onRetry?: () => void }) {
  const { colors } = useTheme();
  const t = useT();
  return (
    <View style={styles.note} accessibilityLiveRegion="polite">
      <View style={styles.noteRow}>
        <View style={styles.noteIcon}>
          <Icon name={icon} size={20} color={colors.textMuted} />
        </View>
        <Text tone="muted" style={styles.flex}>
          {message}
        </Text>
      </View>
      {onRetry ? <Button label={t('common.tryAgain')} icon="refresh" variant="secondary" onPress={onRetry} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  rows: { gap: spacing.md, paddingVertical: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 24 },
  bar: { borderRadius: radii.xs },
  blocks: { gap: spacing.sm },
  block: { borderRadius: radii.md },
  note: { gap: spacing.md },
  // The icon sits on the first line of the copy (body line height 23), not in the middle of a paragraph.
  noteRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  noteIcon: { height: 23, justifyContent: 'center' },
});

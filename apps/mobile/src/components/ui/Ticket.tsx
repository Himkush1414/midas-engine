import type { ReactNode } from 'react';
import { StyleSheet, View, useWindowDimensions, type StyleProp, type ViewStyle } from 'react-native';
import { lips, radii, SLANT_DEG, spacing, type, useTheme } from '@/theme';
import { fitDisplaySize } from './fit';
import { MAX_CONTENT_WIDTH } from './Screen';
import { Icon, type IconName } from '../icons/Icon';
import { LipPressable } from './LipPressable';
import { Text } from './Text';

export interface TicketProps {
  /** Mono kicker above the title. */
  kicker: string;
  title: string;
  detail?: string;
  /** Identity colour: the slanted tab and the glyph. */
  color: string;
  icon: IconName;
  onPress: () => void;
  /** Extra content under the detail (e.g. a mini progress bar). */
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** How many tickets share the row; sizes the title so its longest word never breaks. */
  columns?: number;
  accessibilityLabel?: string;
  testID?: string;
}

/** Gap between tickets that share a row. */
export const TICKET_GAP = spacing.sm;

/** Right inset that keeps text clear of the corner glyph. */
const TITLE_INSET = spacing.xl;

/**
 * An entry to another part of the game (Daily, League, Season). A plate on a lip with a slanted
 * colour tab, a mono kicker and a display title — never a settings-style row.
 */
export function Ticket({ kicker, title, detail, color, icon, onPress, children, style, columns = 1, accessibilityLabel, testID }: TicketProps) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  // Known from the window, not measured, so the title is final on the first frame.
  const inner = (Math.min(width, MAX_CONTENT_WIDTH) - spacing.gutter * 2 - TICKET_GAP * (columns - 1)) / columns - spacing.lg * 2 - TITLE_INSET;
  const longest = title.split(/\s+/).reduce((a, b) => (b.length > a.length ? b : a), '');
  const size = fitDisplaySize(longest, inner, type.heading[0], 18);
  return (
    <LipPressable
      testID={testID}
      onPress={onPress}
      face={colors.surface}
      lipColor={colors.lip}
      lip={lips.sm}
      radius={radii.md}
      style={style}
      faceStyle={styles.face}
      accessibilityLabel={accessibilityLabel ?? `${title}. ${detail ?? ''}`}
    >
      <View style={styles.head}>
        <View style={[styles.tab, { backgroundColor: color }]} />
        <Text variant="micro" tone="muted" numberOfLines={2} style={styles.flex}>
          {kicker}
        </Text>
      </View>
      <View style={styles.mark} pointerEvents="none">
        <Icon name={icon} size={56} color={color} strokeWidth={1.4} />
      </View>
      <Text variant="heading" numberOfLines={3} style={[styles.text, { fontSize: size, lineHeight: size }]}>
        {title}
      </Text>
      {detail ? (
        <Text variant="caption" tone="muted" numberOfLines={3} style={styles.text}>
          {detail}
        </Text>
      ) : null}
      {children}
    </LipPressable>
  );
}

const styles = StyleSheet.create({
  face: { padding: spacing.lg, gap: spacing.xs, overflow: 'hidden', flexGrow: 1 },
  head: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.xs },
  tab: { marginTop: 2, width: 14, height: 10, borderRadius: 1, transform: [{ skewX: `${SLANT_DEG}deg` }] },
  flex: { flex: 1 },
  text: { paddingRight: TITLE_INSET },
  // The glyph sits large in the corner like a stamp; text stays clear of it on the left.
  mark: { position: 'absolute', right: -6, bottom: -8, opacity: 0.22 },
});

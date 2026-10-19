import type { Domain } from '@mindtier/core';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useT } from '@/i18n';
import { domainLabel } from '@/i18n/labels';
import { radii, SLANT_DEG, spacing, useTheme } from '@/theme';
import { Enter, fitMicroSize, MAX_CONTENT_WIDTH, Text } from './ui';

/** Several numbers on one plate, side by side — the scoreboard alternative to a grid of stat tiles. */
export function StatStrip({ items, testID }: { items: { label: string; value: string | number }[]; testID?: string }) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  // One column per stat inside the plate's padding, unless a label's longest word can't fit its column even at the
  // smallest micro size (TAGESRÄTSEL in four columns on a 360 pt phone): then the strip becomes a 2 × 2 grid.
  const inner = Math.min(width, MAX_CONTENT_WIDTH) - spacing.gutter * 2 - spacing.lg * 2;
  const across = (n: number) => (inner - spacing.md * (n - 1)) / n;
  const fits = (n: number) => items.every((s) => fitMicroSize(s.label, across(n), 11, 0) >= 8);
  const perRow = items.length > 2 && !fits(items.length) ? 2 : items.length;
  const column = across(perRow);
  return (
    <View style={[styles.strip, { backgroundColor: colors.surface }]} testID={testID}>
      {items.map((s) => (
        <View key={s.label} style={[styles.stat, perRow < items.length && styles.half]} accessible accessibilityLabel={`${s.label}: ${s.value}`}>
          <Text variant="title" tabular>
            {s.value}
          </Text>
          <Text variant="micro" tone="muted" numberOfLines={3} style={{ fontSize: fitMicroSize(s.label, column) }}>
            {s.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

/** The standout skill of a period: its colour, its name in the display voice and the gain. */
export function BestPlate({ kicker, domain, gain }: { kicker: string; domain: Domain; gain: number }) {
  const { colors, domain: domainColor } = useTheme();
  const t = useT();
  return (
    <View style={[styles.best, { backgroundColor: colors.surface }]} accessible accessibilityLabel={`${kicker}: ${domainLabel(t, domain)} +${gain}`}>
      <View style={[styles.bar, { backgroundColor: domainColor[domain] }]} />
      <View style={styles.flex}>
        <Text variant="micro" tone="muted">
          {kicker}
        </Text>
        <Text variant="title" style={{ color: domainColor[domain] }} numberOfLines={1}>
          {domainLabel(t, domain)}
        </Text>
      </View>
      <Text variant="title" tone="success" tabular>
        +{gain}
      </Text>
    </View>
  );
}

/** Rating change per skill over a period, one plate row each with its slanted domain tab. */
export function GainList({ gains, title }: { gains: { domain: Domain; gain: number }[]; title: string }) {
  const { colors, domain: domainColor } = useTheme();
  const t = useT();
  return (
    <View style={styles.gains}>
      <Text variant="heading">{title}</Text>
      {gains.map((g, i) => (
        <Enter key={g.domain} index={i}>
          <View style={[styles.row, { backgroundColor: colors.surface }]}>
            <View style={[styles.tab, { backgroundColor: domainColor[g.domain] }]} />
            <Text variant="subheading" display weight="semibold" style={styles.flex}>
              {domainLabel(t, g.domain)}
            </Text>
            <Text variant="subheading" display weight="semibold" tabular tone={g.gain > 0 ? 'success' : g.gain < 0 ? 'danger' : 'muted'}>
              {g.gain > 0 ? '+' : g.gain < 0 ? '−' : '±'}
              {Math.abs(g.gain)}
            </Text>
          </View>
        </Enter>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  strip: { flexDirection: 'row', flexWrap: 'wrap', borderRadius: radii.md, padding: spacing.lg, gap: spacing.md },
  half: { flexBasis: '40%' },
  stat: { flex: 1, gap: 2 },
  best: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderRadius: radii.md, padding: spacing.lg, paddingLeft: spacing.xl, overflow: 'hidden' },
  bar: { position: 'absolute', left: -4, top: 0, bottom: 0, width: 12, transform: [{ skewX: `${SLANT_DEG}deg` }] },
  gains: { gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderRadius: radii.sm, paddingVertical: spacing.md, paddingHorizontal: spacing.lg, overflow: 'hidden' },
  tab: { width: 14, height: 8, borderRadius: 1, transform: [{ skewX: `${SLANT_DEG}deg` }] },
});

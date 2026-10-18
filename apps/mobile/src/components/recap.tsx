import type { Domain } from '@mindtier/core';
import { StyleSheet, View } from 'react-native';
import { useT } from '@/i18n';
import { domainLabel } from '@/i18n/labels';
import { radii, SLANT_DEG, spacing, useTheme } from '@/theme';
import { Enter, Text } from './ui';

/** Several numbers on one plate, side by side — the scoreboard alternative to a grid of stat tiles. */
export function StatStrip({ items, testID }: { items: { label: string; value: string | number }[]; testID?: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.strip, { backgroundColor: colors.surface }]} testID={testID}>
      {items.map((s) => (
        <View key={s.label} style={styles.stat} accessible accessibilityLabel={`${s.label}: ${s.value}`}>
          <Text variant="title" tabular>
            {s.value}
          </Text>
          <Text variant="micro" tone="muted" numberOfLines={3}>
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
  strip: { flexDirection: 'row', borderRadius: radii.md, padding: spacing.lg, gap: spacing.md },
  stat: { flex: 1, gap: 2 },
  best: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderRadius: radii.md, padding: spacing.lg, paddingLeft: spacing.xl, overflow: 'hidden' },
  bar: { position: 'absolute', left: -4, top: 0, bottom: 0, width: 12, transform: [{ skewX: `${SLANT_DEG}deg` }] },
  gains: { gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderRadius: radii.sm, paddingVertical: spacing.md, paddingHorizontal: spacing.lg, overflow: 'hidden' },
  tab: { width: 14, height: 8, borderRadius: 1, transform: [{ skewX: `${SLANT_DEG}deg` }] },
});

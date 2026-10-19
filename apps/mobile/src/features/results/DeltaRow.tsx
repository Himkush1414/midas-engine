import { getGame, tierInfo, type Domain, type GameId, type RatingUpdate } from '@mindtier/core';
import { StyleSheet, View } from 'react-native';
import { Icon } from '@/components/icons/Icon';
import { TierBadge } from '@/components/tier';
import { Enter, RollingNumber, Text } from '@/components/ui';
import { useT } from '@/i18n';
import { domainLabel, tierLabel } from '@/i18n/labels';
import { radii, SLANT_DEG, spacing, useTheme } from '@/theme';

/** One game's rating change: a plate with the domain tab, the game in the display voice and the delta rolling in. */
export function DeltaRow({
  update,
  index,
}: {
  update: RatingUpdate & { domain: Domain; gameId: GameId };
  index: number;
  reduceMotion?: boolean;
}) {
  const { colors, domain: domainColor } = useTheme();
  const t = useT();
  const after = tierInfo(update.after);
  const up = update.delta > 0;
  const flat = update.delta === 0;
  const tone = flat ? colors.textMuted : up ? colors.success : colors.danger;
  return (
    <Enter index={index + 3}>
      <View
        style={[styles.row, { backgroundColor: colors.surface }]}
        accessible
        accessibilityLabel={t('results.deltaA11y', {
          domain: domainLabel(t, update.domain),
          change: flat ? t('results.noChange') : t(up ? 'results.up' : 'results.down', { n: Math.abs(update.delta) }),
          label: tierLabel(t, after),
        })}
      >
        <View style={[styles.tab, { backgroundColor: domainColor[update.domain] }]} />
        <View style={styles.text}>
          {/* Two-word names wrap on narrow phones rather than truncate ("GRID REC…"). */}
          <Text variant="heading" numberOfLines={2}>
            {getGame(update.gameId).name}
          </Text>
          <View style={styles.meta}>
            <Text variant="micro" tone="muted" style={styles.metaPart}>
              {domainLabel(t, update.domain)} ·
            </Text>
            <Text variant="micro" tone="muted" tabular style={styles.metaPart}>
              {Math.round(update.before.rating)} → {Math.round(update.after.rating)}
            </Text>
          </View>
        </View>
        <View style={styles.delta}>
          {!flat ? <Icon name={up ? 'arrowUp' : 'arrowDown'} size={18} color={tone} strokeWidth={2.6} /> : null}
          <RollingNumber
            value={flat ? '±0' : `${up ? '+' : '−'}${Math.abs(update.delta)}`}
            variant="heading"
            display
            style={{ color: tone }}
          />
        </View>
        <TierBadge info={after} size={40} />
      </View>
    </Enter>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderRadius: radii.md, padding: spacing.md, paddingLeft: spacing.lg, overflow: 'hidden' },
  tab: { position: 'absolute', left: -4, top: 0, bottom: 0, width: 10, transform: [{ skewX: `${SLANT_DEG}deg` }] },
  text: { flex: 1, gap: 2 },
  meta: { flexDirection: 'row', flexWrap: 'wrap', columnGap: spacing.xs },
  metaPart: { flexShrink: 0 },
  delta: { flexDirection: 'row', alignItems: 'center', gap: 2, minWidth: 64, justifyContent: 'flex-end' },
});

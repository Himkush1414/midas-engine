import { DOMAINS, tierInfo, type Domain, type DomainRatings } from '@mindtier/core';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { Icon } from '@/components/icons/Icon';
import { TierBadge } from '@/components/tier';
import { Enter, fitDisplaySize, LipPressable, MAX_CONTENT_WIDTH, Text } from '@/components/ui';
import { useT } from '@/i18n';
import { domainLabel, tierLabel } from '@/i18n/labels';
import { lips, radii, SLANT_DEG, spacing, useTheme } from '@/theme';

/**
 * The six skills as a 3×2 grid of tiles: each carries its domain colour on a slanted tab, the
 * rating in the display voice and the tier badge it has reached.
 */
export function DomainList({ ratings, onPress }: { ratings: DomainRatings; onPress?(domain: Domain): void }) {
  const { colors, domain: domainColor } = useTheme();
  const t = useT();
  const { width } = useWindowDimensions();
  const inner = (Math.min(width, MAX_CONTENT_WIDTH) - spacing.gutter * 2 - GAP * 2) / 3 - PAD * 2;
  return (
    <View style={styles.grid}>
      {DOMAINS.map((d, i) => {
        const info = tierInfo(ratings[d]);
        const color = domainColor[d];
        const tier = info.provisional ? t('tiers.provisional') : tierLabel(t, info);
        const body = (
          <>
            <View style={styles.head}>
              <View style={[styles.tab, { backgroundColor: color }]} />
              <TierBadge info={info} size={30} />
            </View>
            <Icon name={d} size={24} color={color} />
            <Text variant="heading" tabular style={styles.rating}>
              {Math.round(ratings[d].rating)}
            </Text>
            <Text
              variant="label"
              display
              weight="medium"
              tone="muted"
              numberOfLines={1}
              style={[styles.name, { fontSize: fitDisplaySize(domainLabel(t, d), inner, 16, 11, 0.56) }]}
            >
              {domainLabel(t, d)}
            </Text>
          </>
        );
        return (
          <Enter key={d} index={i} style={styles.cell}>
            {onPress ? (
              <LipPressable
                onPress={() => onPress(d)}
                face={colors.surface}
                lipColor={colors.lip}
                lip={lips.sm}
                radius={radii.md}
                faceStyle={styles.tile}
                accessibilityLabel={`${domainLabel(t, d)}: ${tier}, ${Math.round(ratings[d].rating)}`}
              >
                {body}
              </LipPressable>
            ) : (
              <View style={[styles.tile, { backgroundColor: colors.surface, borderRadius: radii.md }]}>{body}</View>
            )}
          </Enter>
        );
      })}
    </View>
  );
}

const GAP = spacing.sm;
const PAD = spacing.md;

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  cell: { flexBasis: '31%', flexGrow: 1 },
  tile: { padding: PAD, gap: spacing.xs, minHeight: 132 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xs },
  tab: { width: 18, height: 8, borderRadius: 1, transform: [{ skewX: `${SLANT_DEG}deg` }] },
  rating: { marginTop: spacing.xs },
  name: { fontSize: 16, lineHeight: 18, letterSpacing: 0.6 },
});

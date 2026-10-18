import { overallRating, tierInfo, type DomainRatings } from '@mindtier/core';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { TierBadge } from '@/components/tier';
import { Enter, fitDisplaySize, MAX_CONTENT_WIDTH, ProgressBar, RollingNumber, Text } from '@/components/ui';
import { useT } from '@/i18n';
import { tierLabel, tierParts } from '@/i18n/labels';
import { spacing, tierColors, type } from '@/theme';

const BADGE = 116;

/** The hero of Home: the player's Mind tier set huge in its own colour, the rating rolling in beside the forged badge. */
export function RankHero({ ratings }: { ratings: DomainRatings }) {
  const t = useT();
  const { width } = useWindowDimensions();
  const overall = overallRating(ratings);
  const info = tierInfo(overall);
  const color = tierColors[info.tier].base;
  const rating = Math.round(overall.rating);
  const toNext = info.nextThreshold === null ? null : Math.max(0, info.nextThreshold - rating);
  const { name, division } = tierParts(t, info);
  const column = Math.min(width, MAX_CONTENT_WIDTH) - spacing.gutter * 2;
  const nameSize = fitDisplaySize(division ? `${name} ${division}` : name, column, type.mega[0], 44);
  return (
    <View accessible accessibilityLabel={t('home.tierA11y', { label: tierLabel(t, info), rating })} style={styles.root}>
      <Enter index={0} style={styles.top}>
        <View style={styles.badge}>
          <View style={[styles.glow, { boxShadow: `0 0 56px 10px ${color}66` }]} />
          <TierBadge info={info} size={BADGE} showProvisional={false} />
        </View>
        <View style={styles.rating}>
          <Text variant="micro" tone="muted">
            {t('home.ratingLabel')}
          </Text>
          <RollingNumber value={String(rating)} variant="hero" display style={styles.ratingNumber} />
          {info.provisional ? (
            <Text variant="micro" tone="faint">
              {t('home.settling').replace(/^\s*·\s*/, '')}
            </Text>
          ) : null}
        </View>
      </Enter>
      <Enter index={1} style={styles.name}>
        <Text variant="micro" tone="muted">
          {t('home.mindTier')}
        </Text>
        <Text variant="mega" numberOfLines={1} style={{ fontSize: nameSize, lineHeight: nameSize * 0.92, color }}>
          {name}
          {division ? <Text variant="mega" style={{ fontSize: nameSize, lineHeight: nameSize * 0.92 }}>{` ${division}`}</Text> : null}
        </Text>
      </Enter>
      <Enter index={2} style={styles.progress}>
        <ProgressBar value={info.progress} color={color} segments={10} height={12} accessibilityLabel={t('home.progressA11y')} />
        <Text variant="micro" tone="muted" tabular>
          {toNext === null ? t('home.top') : t('home.toNext', { count: toNext })}
        </Text>
      </Enter>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.md, paddingTop: spacing.sm },
  top: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  badge: { width: BADGE, height: BADGE, alignItems: 'center', justifyContent: 'center' },
  glow: { position: 'absolute', width: BADGE * 0.6, height: BADGE * 0.6, borderRadius: BADGE },
  rating: { flex: 1, gap: 2 },
  ratingNumber: { fontSize: 72, lineHeight: 66 },
  name: { gap: spacing.xs },
  progress: { gap: spacing.sm },
});

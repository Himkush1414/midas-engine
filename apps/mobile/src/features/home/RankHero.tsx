import { overallRating, tierInfo, type DomainRatings } from '@mindtier/core';
import { StyleSheet, View } from 'react-native';
import { TierBadge } from '@/components/tier';
import { Card, ProgressBar, Text } from '@/components/ui';
import { useT } from '@/i18n';
import { tierLabel } from '@/i18n/labels';
import { spacing, tierColors } from '@/theme';

export function RankHero({ ratings }: { ratings: DomainRatings }) {
  const t = useT();
  const overall = overallRating(ratings);
  const info = tierInfo(overall);
  const color = tierColors[info.tier].base;
  const toNext = info.nextThreshold === null ? null : Math.max(0, info.nextThreshold - Math.round(overall.rating));
  return (
    <Card raised style={styles.card} accessibilityLabel={t('home.tierA11y', { label: tierLabel(t, info), rating: Math.round(overall.rating) })}>
      <View style={styles.row}>
        <TierBadge info={info} size={104} showProvisional={false} />
        <View style={styles.text}>
          <Text variant="caption" tone="faint" weight="semibold">
            {t('home.mindTier')}
          </Text>
          <Text variant="title">{tierLabel(t, info)}</Text>
          <Text tone="muted" tabular>
            {t('home.rating', { rating: Math.round(overall.rating) })}
            {info.provisional ? t('home.settling') : ''}
          </Text>
        </View>
      </View>
      <View style={styles.progress}>
        <ProgressBar value={info.progress} color={color} accessibilityLabel={t('home.progressA11y')} />
        <Text variant="caption" tone="muted" tabular>
          {toNext === null ? t('home.top') : t('home.toNext', { count: toNext })}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  text: { flex: 1, gap: 2 },
  progress: { gap: spacing.xs },
});

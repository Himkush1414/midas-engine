import { overallRating, tierInfo, type DomainRatings } from '@mindtier/core';
import { StyleSheet, View } from 'react-native';
import { TierBadge } from '@/components/tier';
import { Card, ProgressBar, Text } from '@/components/ui';
import { spacing, tierColors } from '@/theme';

export function RankHero({ ratings }: { ratings: DomainRatings }) {
  const overall = overallRating(ratings);
  const info = tierInfo(overall);
  const color = tierColors[info.tier].base;
  const toNext = info.nextThreshold === null ? null : Math.max(0, info.nextThreshold - Math.round(overall.rating));
  return (
    <Card raised style={styles.card} accessibilityLabel={`Your Mind tier is ${info.label}, rating ${Math.round(overall.rating)}`}>
      <View style={styles.row}>
        <TierBadge info={info} size={104} showProvisional={false} />
        <View style={styles.text}>
          <Text variant="caption" tone="faint" weight="semibold">
            MIND TIER
          </Text>
          <Text variant="title">{info.label}</Text>
          <Text tone="muted" tabular>
            Rating {Math.round(overall.rating)}
            {info.provisional ? ' · settling in' : ''}
          </Text>
        </View>
      </View>
      <View style={styles.progress}>
        <ProgressBar value={info.progress} color={color} accessibilityLabel="Progress to next division" />
        <Text variant="caption" tone="muted" tabular>
          {toNext === null ? 'Top of the ladder' : `${toNext} points to the next division`}
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

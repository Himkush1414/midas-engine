import { DOMAINS, DOMAIN_LABELS, tierInfo, type Domain, type DomainRatings } from '@mindtier/core';
import { StyleSheet, View } from 'react-native';
import { Icon } from '@/components/icons/Icon';
import { DomainBadge, TierBadge } from '@/components/tier';
import { Card, Text } from '@/components/ui';
import { spacing, useTheme } from '@/theme';

export function DomainList({ ratings, onPress }: { ratings: DomainRatings; onPress?(domain: Domain): void }) {
  const { colors } = useTheme();
  return (
    <Card padded={false}>
      {DOMAINS.map((d, i) => {
        const info = tierInfo(ratings[d]);
        const content = (
          <View style={[styles.row, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
            <DomainBadge domain={d} size={36} />
            <View style={styles.label}>
              <Text weight="semibold">{DOMAIN_LABELS[d]}</Text>
              <Text variant="caption" tone="muted" tabular>
                {info.provisional ? 'Provisional' : info.label} · {Math.round(ratings[d].rating)}
              </Text>
            </View>
            <TierBadge info={info} size={36} />
            {onPress ? <Icon name="chevronRight" size={18} color={colors.textFaint} /> : null}
          </View>
        );
        return onPress ? (
          <Card key={d} padded={false} onPress={() => onPress(d)} style={styles.flat} accessibilityLabel={`${DOMAIN_LABELS[d]}: ${info.label}`}>
            {content}
          </Card>
        ) : (
          <View key={d}>{content}</View>
        );
      })}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  label: { flex: 1 },
  flat: { borderWidth: 0, borderRadius: 0 },
});

import { DOMAINS, tierInfo, type Domain, type DomainRatings } from '@mindtier/core';
import { useT } from '@/i18n';
import { domainLabel, tierLabel } from '@/i18n/labels';
import { StyleSheet, View } from 'react-native';
import { Icon } from '@/components/icons/Icon';
import { DomainBadge, TierBadge } from '@/components/tier';
import { Card, Text } from '@/components/ui';
import { spacing, useTheme } from '@/theme';

export function DomainList({ ratings, onPress }: { ratings: DomainRatings; onPress?(domain: Domain): void }) {
  const { colors } = useTheme();
  const t = useT();
  return (
    <Card padded={false}>
      {DOMAINS.map((d, i) => {
        const info = tierInfo(ratings[d]);
        const content = (
          <View style={[styles.row, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
            <DomainBadge domain={d} size={36} />
            <View style={styles.label}>
              <Text weight="semibold">{domainLabel(t, d)}</Text>
              <Text variant="caption" tone="muted" tabular>
                {info.provisional ? t('tiers.provisional') : tierLabel(t, info)} · {Math.round(ratings[d].rating)}
              </Text>
            </View>
            <TierBadge info={info} size={36} />
            {onPress ? <Icon name="chevronRight" size={18} color={colors.textFaint} /> : null}
          </View>
        );
        return onPress ? (
          <Card key={d} padded={false} onPress={() => onPress(d)} style={styles.flat} accessibilityLabel={`${domainLabel(t, d)}: ${tierLabel(t, info)}`}>
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

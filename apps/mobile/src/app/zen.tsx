import { DOMAINS, DOMAIN_LABELS, FREE_ZEN_GAMES, GAMES, GAMES_BY_DOMAIN } from '@mindtier/core';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { BackHeader } from '@/components/BackHeader';
import { Icon } from '@/components/icons/Icon';
import { DomainBadge } from '@/components/tier';
import { Card, Screen, Text } from '@/components/ui';
import { startZen } from '@/features/session/start';
import { useEntitlements } from '@/state/entitlements';
import { spacing, useTheme } from '@/theme';

export default function Zen() {
  const { colors } = useTheme();
  const isPro = useEntitlements((s) => s.isPro);
  return (
    <Screen scroll>
      <BackHeader title="Zen practice" />
      <Text tone="muted" style={styles.intro}>
        No timer, no rating — just play. Great for learning a game before it counts.
      </Text>
      <View style={styles.stack}>
        {DOMAINS.map((d) => (
          <View key={d} style={styles.group}>
            <View style={styles.groupHeader}>
              <DomainBadge domain={d} size={28} />
              <Text variant="subheading" weight="semibold">
                {DOMAIN_LABELS[d]}
              </Text>
            </View>
            {GAMES_BY_DOMAIN[d].map((g) => {
              const free = FREE_ZEN_GAMES.includes(g);
              const locked = !free && !isPro;
              return (
                <Card
                  key={g}
                  onPress={() => (locked ? router.push({ pathname: '/paywall', params: { from: 'zen' } }) : startZen(g))}
                  accessibilityLabel={`${GAMES[g].name}${locked ? ', Pro' : ''}`}
                  accessibilityHint={locked ? 'Opens Mindtier Pro' : 'Starts an untimed practice game'}
                >
                  <View style={styles.row}>
                    <View style={styles.flex}>
                      <Text weight="semibold">{GAMES[g].name}</Text>
                      <Text variant="caption" tone="muted">
                        {GAMES[g].rules}
                      </Text>
                    </View>
                    <Icon name={locked ? 'lock' : 'play'} size={20} color={locked ? colors.textFaint : colors.primaryText} />
                  </View>
                </Card>
              );
            })}
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  intro: { marginBottom: spacing.lg },
  stack: { gap: spacing.xl },
  group: { gap: spacing.sm },
  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});

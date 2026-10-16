import { DOMAINS, FREE_ZEN_GAMES, GAMES, GAMES_BY_DOMAIN } from '@mindtier/core';
import { useT } from '@/i18n';
import { domainLabel, gameRules } from '@/i18n/labels';
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
  const t = useT();
  const isPro = useEntitlements((s) => s.isPro);
  return (
    <Screen scroll>
      <BackHeader title={t('zen.title')} />
      <Text tone="muted" style={styles.intro}>
        {t('zen.intro')}
      </Text>
      <View style={styles.stack}>
        {DOMAINS.map((d) => (
          <View key={d} style={styles.group}>
            <View style={styles.groupHeader}>
              <DomainBadge domain={d} size={28} />
              <Text variant="subheading" weight="semibold">
                {domainLabel(t, d)}
              </Text>
            </View>
            {GAMES_BY_DOMAIN[d].map((g) => {
              const free = FREE_ZEN_GAMES.includes(g);
              const locked = !free && !isPro;
              return (
                <Card
                  key={g}
                  onPress={() => (locked ? router.push({ pathname: '/paywall', params: { from: 'zen' } }) : startZen(g))}
                  accessibilityLabel={`${GAMES[g].name}${locked ? t('zen.pro') : ''}`}
                  accessibilityHint={locked ? t('zen.proHint') : t('zen.playHint')}
                >
                  <View style={styles.row}>
                    <View style={styles.flex}>
                      <Text weight="semibold">{GAMES[g].name}</Text>
                      <Text variant="caption" tone="muted">
                        {gameRules(t, g)}
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

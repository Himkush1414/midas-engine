import { DOMAINS, DOMAIN_LABELS, GAMES, GAMES_BY_DOMAIN } from '@mindtier/core';
import { View, StyleSheet } from 'react-native';
import { BackHeader } from '@/components/BackHeader';
import { SettingsRow, SettingsSection } from '@/components/settings';
import { Screen } from '@/components/ui';
import { useSettings } from '@/state/settings';
import { spacing } from '@/theme';

export default function GamesSettings() {
  const hidden = useSettings((s) => s.hiddenGames);
  const toggle = useSettings((s) => s.toggleHiddenGame);

  return (
    <Screen scroll>
      <BackHeader title="Ranked rotation" />
      <View style={styles.stack}>
        {DOMAINS.map((d) => {
          const games = GAMES_BY_DOMAIN[d];
          const enabled = games.filter((g) => !hidden.includes(g));
          return (
            <SettingsSection key={d} title={DOMAIN_LABELS[d]} footer={enabled.length === 1 ? 'At least one game per domain stays on.' : undefined}>
              {games.map((g, i) => {
                const on = !hidden.includes(g);
                const lastOn = on && enabled.length === 1;
                return (
                  <SettingsRow
                    key={g}
                    first={i === 0}
                    label={GAMES[g].name}
                    detail={GAMES[g].rules}
                    switchValue={on}
                    disabled={lastOn}
                    onSwitch={() => toggle(g)}
                  />
                );
              })}
            </SettingsSection>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing.xl },
});

import { DOMAINS, GAMES, GAMES_BY_DOMAIN } from '@mindtier/core';
import { useT } from '@/i18n';
import { domainLabel, gameRules } from '@/i18n/labels';
import { View, StyleSheet } from 'react-native';
import { BackHeader } from '@/components/BackHeader';
import { SettingsRow, SettingsSection } from '@/components/settings';
import { Screen } from '@/components/ui';
import { useSettings } from '@/state/settings';
import { spacing } from '@/theme';

export default function GamesSettings() {
  const t = useT();
  const hidden = useSettings((s) => s.hiddenGames);
  const toggle = useSettings((s) => s.toggleHiddenGame);

  return (
    <Screen scroll>
      <BackHeader title={t('settings.rotationTitle')} />
      <View style={styles.stack}>
        {DOMAINS.map((d) => {
          const games = GAMES_BY_DOMAIN[d];
          const enabled = games.filter((g) => !hidden.includes(g));
          return (
            <SettingsSection key={d} title={domainLabel(t, d)} footer={enabled.length === 1 ? t('settings.oneStaysOn') : undefined}>
              {games.map((g, i) => {
                const on = !hidden.includes(g);
                const lastOn = on && enabled.length === 1;
                return (
                  <SettingsRow
                    key={g}
                    first={i === 0}
                    label={GAMES[g].name}
                    detail={gameRules(t, g)}
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

import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Icon } from '@/components/icons/Icon';
import { Button, Card, Screen, Text } from '@/components/ui';
import { createAndPlayDuel } from '@/features/duels/actions';
import { useT, type TFunction } from '@/i18n';
import { normaliseDuelCode, useDuels, type LocalDuel } from '@/state/duels';
import { fonts, radii, spacing, useTheme } from '@/theme';

function status(t: TFunction, d: LocalDuel): { label: string; tone: 'success' | 'danger' | 'muted' | 'accent' } {
  if (d.myPoints === null) return { label: t('duels.yourTurn'), tone: 'accent' };
  if (!d.opponent) return { label: t('duels.waiting'), tone: 'muted' };
  if (d.myPoints === d.opponent.points) return { label: t('duels.draw'), tone: 'muted' };
  return d.myPoints > d.opponent.points
    ? { label: t('duels.youWon', { name: d.opponent.name }), tone: 'success' }
    : { label: t('duels.theyWon', { name: d.opponent.name }), tone: 'danger' };
}

export default function Duels() {
  const { colors } = useTheme();
  const t = useT();
  const duels = useDuels((s) => s.duels);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const parsed = normaliseDuelCode(code);

  const create = async () => {
    setBusy(true);
    await createAndPlayDuel();
    setBusy(false);
  };

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text variant="title">{t('duels.title')}</Text>
        <Text tone="muted">{t('duels.subtitle')}</Text>
      </View>

      <View style={styles.stack}>
        <Card raised style={styles.gap}>
          <View style={styles.row}>
            <View style={[styles.icon, { backgroundColor: colors.surfaceSunken }]}>
              <Icon name="duel" size={26} color={colors.primaryText} />
            </View>
            <View style={styles.flex}>
              <Text variant="subheading" weight="semibold">
                {t('duels.challengeTitle')}
              </Text>
              <Text variant="caption" tone="muted">
                {t('duels.challengeBody')}
              </Text>
            </View>
          </View>
          <Button label={t('duels.newDuel')} icon="userPlus" size="lg" fullWidth loading={busy} onPress={create} testID="duel-new" />
        </Card>

        <Card style={styles.gap}>
          <Text weight="semibold">{t('duels.gotCode')}</Text>
          <View style={styles.row}>
            <TextInput
              value={code}
              onChangeText={setCode}
              placeholder={t('duels.codePlaceholder')}
              placeholderTextColor={colors.textFaint}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={80}
              accessibilityLabel={t('duels.codeA11y')}
              style={[styles.input, { color: colors.text, borderColor: colors.borderStrong, backgroundColor: colors.surfaceSunken, fontFamily: fonts.bodySemibold }]}
            />
            <Button label={t('common.open')} disabled={!parsed} onPress={() => parsed && router.push(`/duel/${parsed}`)} />
          </View>
        </Card>

        {duels.length > 0 ? (
          <View style={styles.gap}>
            <Text variant="subheading" weight="semibold">
              {t('duels.yours')}
            </Text>
            {duels.map((d) => {
              const s = status(t, d);
              return (
                <Card key={d.id} onPress={() => router.push(`/duel/${d.id}`)} accessibilityLabel={`Duel ${d.id}, ${s.label}`}>
                  <View style={styles.row}>
                    <View style={styles.flex}>
                      <Text weight="semibold" tabular>
                        {d.id.toUpperCase()}
                      </Text>
                      <Text variant="caption" tone={s.tone}>
                        {s.label}
                      </Text>
                    </View>
                    {d.myPoints !== null ? (
                      <Text tabular weight="semibold">
                        {d.myPoints.toLocaleString()}
                      </Text>
                    ) : null}
                    <Icon name="chevronRight" size={18} color={colors.textFaint} />
                  </View>
                </Card>
              );
            })}
          </View>
        ) : (
          <Text tone="faint" align="center">
            {t('duels.empty')}
          </Text>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { paddingVertical: spacing.md, gap: 2 },
  stack: { gap: spacing.lg },
  gap: { gap: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  icon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, minHeight: 48, borderWidth: 1.5, borderRadius: radii.md, paddingHorizontal: spacing.md, fontSize: 16, letterSpacing: 1 },
});
